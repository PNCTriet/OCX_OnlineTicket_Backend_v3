import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Resend } from 'resend';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as QRCode from 'qrcode';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private readonly prisma: PrismaService) {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendTicketEmail(orderId: string) {
    try {
      // 1. Lấy thông tin order với user, event, tickets
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          event: {
            include: {
              organization: true,
            },
          },
          order_items: {
            include: {
              ticket: true,
              codes: {
                where: { active: true },
              },
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== OrderStatus.PAID) {
        throw new BadRequestException('Order must be paid to send tickets');
      }

      if (!order.user.email) {
        throw new BadRequestException('User email not found');
      }

      // 2. Tạo PDF cho từng vé
      const pdfAttachments: any[] = [];
      let ticketCounter = 1;

      for (const orderItem of order.order_items) {
        for (let i = 0; i < orderItem.quantity; i++) {
          const code = orderItem.codes[i];
          if (!code) {
            console.warn(`No QR code found for order item ${orderItem.id}, ticket ${i + 1}`);
            continue;
          }

          const ticketData = {
            ticketId: code.code,
            customerName: `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() || 'Khách hàng',
            eventName: order.event?.title || 'Sự kiện',
            eventDate: order.event?.start_date ? new Date(order.event.start_date).toLocaleDateString('vi-VN') : 'TBD',
            eventTime: order.event?.start_date ? new Date(order.event.start_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'TBD',
            venue: order.event?.location || 'Địa điểm TBD',
            ticketType: orderItem.ticket.name,
            price: Number(orderItem.price),
            qrCode: code.code,
            organizationName: order.event?.organization?.name || 'Ớt Cay Xè',
          };

          const pdfBuffer = await this.generateTicketPDF(ticketData);
          
          pdfAttachments.push({
            filename: `ve-${code.code}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          });

          ticketCounter++;
        }
      }

      if (pdfAttachments.length === 0) {
        throw new BadRequestException('No tickets found for this order');
      }

      // 3. Tạo HTML email content
      const htmlContent = this.generateEmailHTML({
        customerInfo: {
          fullName: `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() || 'Khách hàng',
          email: order.user.email,
          phone: order.user.phone || '',
        },
        orderInfo: {
          orderNumber: order.id,
          orderDate: order.created_at.toLocaleDateString('vi-VN'),
          orderTime: order.created_at.toLocaleTimeString('vi-VN'),
          totalAmount: Number(order.total_amount),
        },
        tickets: order.order_items.map(item => ({
          id: item.ticket.id,
          name: item.ticket.name,
          price: Number(item.price),
          quantity: item.quantity,
          color: '#F06185',
          label: item.ticket.description || '',
        })),
        eventInfo: {
          name: order.event?.title || 'Sự kiện',
          date: order.event?.start_date ? new Date(order.event.start_date).toLocaleDateString('vi-VN') : 'TBD',
          time: order.event?.start_date ? new Date(order.event.start_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'TBD',
          venue: order.event?.location || 'Địa điểm TBD',
          address: order.event?.location || 'Địa chỉ TBD',
        },
        organizationInfo: order.event?.organization,
      });

      // 4. Gửi email qua Resend với PDF attachments
      const emailResult = await this.resend.emails.send({
        from: 'Ớt Cay Xè <noreply@otcayxe.com>',
        to: [order.user.email],
        subject: `🎫 Vé điện tử ${order.event?.title || 'Ớt Cay Xè'} - Đơn hàng #${order.id}`,
        html: htmlContent,
        attachments: pdfAttachments,
      });

      // 5. Cập nhật trạng thái gửi email
      await this.prisma.order.update({
        where: { id: orderId },
        data: { sending_status: 'SENT' },
      });

      return {
        success: true,
        message: 'Email sent successfully with PDF tickets attached',
        ticketsSent: pdfAttachments.length,
        orderNumber: order.id,
        sentAt: new Date().toISOString(),
        emailId: emailResult.data?.id,
        attachments: pdfAttachments.map(att => att.filename),
      };

    } catch (error) {
      console.error('Error sending ticket email:', error);
      
      // Cập nhật trạng thái lỗi
      await this.prisma.order.update({
        where: { id: orderId },
        data: { sending_status: 'FAILED' },
      });

      throw error;
    }
  }

  private async generateTicketPDF(ticketData: any): Promise<Buffer> {
    try {
      // Tạo QR code base64
      const qrCodeDataUrl = await QRCode.toDataURL(ticketData.qrCode, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 200,
      });

      // Tạo PDF document với fontkit
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      
      // Sử dụng font built-in để tránh lỗi
      const font = await pdfDoc.embedFont('Helvetica');
      
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points

      // Embed QR code image
      const base64Data = qrCodeDataUrl.split(',')[1]; // Remove data:image/png;base64, prefix
      const imageBytes = Buffer.from(base64Data, 'base64');
      const image = await pdfDoc.embedPng(imageBytes);

      // Scale image to fit nicely on page
      const { width, height } = image.scale(0.3); // Scale down to 30%

      // Center the QR code image
      const x = (595.28 - width) / 2;
      const y = (841.89 - height) / 2;

      // Draw the QR code image
      page.drawImage(image, {
        x,
        y,
        width,
        height,
      });

      // Add text content với font built-in (ASCII safe)
      const fontSize = 12;
      const lineHeight = fontSize * 1.2;
      let currentY = 750; // Start from top

      // Title
      page.drawText('VE DIEN TU', {
        x: 50,
        y: currentY,
        size: 20,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentY -= lineHeight * 2;

      // Ticket information với ASCII safe text
      const infoTexts = [
        `Ma ve: ${ticketData.ticketId}`,
        `Khach hang: ${ticketData.customerName.replace(/[Đđ]/g, 'D')}`,
        `Su kien: ${ticketData.eventName.replace(/[Đđ]/g, 'D')}`,
        `Ngay: ${ticketData.eventDate}`,
        `Gio: ${ticketData.eventTime}`,
        `Dia diem: ${ticketData.venue.replace(/[Đđ]/g, 'D')}`,
        `Loai ve: ${ticketData.ticketType.replace(/[Đđ]/g, 'D')}`,
        `Gia: ${ticketData.price.toLocaleString()} VND`,
      ];

      infoTexts.forEach(text => {
        page.drawText(text, {
          x: 50,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        currentY -= lineHeight;
      });

      // Terms and conditions
      currentY -= lineHeight;
      page.drawText('Dieu khoan:', {
        x: 50,
        y: currentY,
        size: fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentY -= lineHeight;

      const terms = [
        '• Moi ve chi danh cho 1 nguoi',
        '• Trinh ve tai cua de vao su kien',
        '• Khong ho tro giu cho',
      ];

      terms.forEach(term => {
        page.drawText(term, {
          x: 70,
          y: currentY,
          size: fontSize - 2,
          font,
          color: rgb(0.4, 0.4, 0.4),
        });
        currentY -= lineHeight;
      });

      // Footer
      page.drawText(`© 2024 ${ticketData.organizationName.replace(/[Đđ]/g, 'D')}`, {
        x: 50,
        y: 50,
        size: fontSize - 2,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Save PDF to buffer
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  private generateEmailHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vé Điện Tử - ${data.eventInfo.name}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons@latest/iconfont/tabler-icons.min.css">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .header p {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .section {
            margin-bottom: 32px;
          }
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
          }
          .info-item {
            background-color: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          .info-label {
            font-size: 12px;
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
          }
          .ticket-card {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          }
          .ticket-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          .ticket-name {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
          }
          .ticket-price {
            font-size: 18px;
            font-weight: 700;
            color: #059669;
          }
          .ticket-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 14px;
            color: #6b7280;
          }
          .total-section {
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 12px;
            padding: 20px;
            margin-top: 24px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 18px;
            font-weight: 700;
            color: #0c4a6e;
          }
          .footer {
            background-color: #1f2937;
            color: white;
            text-align: center;
            padding: 30px;
            font-size: 14px;
          }
          .footer p {
            margin: 8px 0;
            opacity: 0.8;
          }
          .contact-info {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin-top: 24px;
          }
          .contact-title {
            font-size: 14px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 8px;
          }
          .contact-item {
            font-size: 12px;
            color: #78350f;
            margin: 4px 0;
          }
          .pdf-notice {
            background-color: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 16px;
            margin-top: 24px;
            text-align: center;
          }
          .pdf-notice-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 8px;
          }
          .pdf-notice-text {
            font-size: 14px;
            color: #1e3a8a;
          }
          @media (max-width: 600px) {
            .info-grid {
              grid-template-columns: 1fr;
            }
            .ticket-details {
              grid-template-columns: 1fr;
            }
            .content {
              padding: 20px;
            }
            .header {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎫 Vé Điện Tử</h1>
            <p>${data.organizationInfo?.name || 'Ớt Cay Xè Studio'}</p>
          </div>
          
          <div class="content">
            <div class="section">
              <h2 class="section-title">
                <i class="ti ti-receipt"></i>
                Thông Tin Đơn Hàng
              </h2>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Mã đơn hàng</div>
                  <div class="info-value">#${data.orderInfo.orderNumber}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Ngày đặt</div>
                  <div class="info-value">${data.orderInfo.orderDate}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Sự kiện</div>
                  <div class="info-value">${data.eventInfo.name}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Tổ chức</div>
                  <div class="info-value">${data.organizationInfo?.name || 'Ớt Cay Xè Studio'}</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2 class="section-title">
                <i class="ti ti-user"></i>
                Thông Tin Khách Hàng
              </h2>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Họ tên</div>
                  <div class="info-value">${data.customerInfo.fullName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">${data.customerInfo.email}</div>
                </div>
                ${data.customerInfo.phone ? `
                <div class="info-item">
                  <div class="info-label">Số điện thoại</div>
                  <div class="info-value">${data.customerInfo.phone}</div>
                </div>
                ` : ''}
              </div>
            </div>
            
            <div class="section">
              <h2 class="section-title">
                <i class="ti ti-calendar-event"></i>
                Thông Tin Sự Kiện
              </h2>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Thời gian</div>
                  <div class="info-value">${data.eventInfo.date} ${data.eventInfo.time}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Địa điểm</div>
                  <div class="info-value">${data.eventInfo.venue}</div>
                </div>
                ${data.eventInfo.address ? `
                <div class="info-item">
                  <div class="info-label">Địa chỉ</div>
                  <div class="info-value">${data.eventInfo.address}</div>
                </div>
                ` : ''}
              </div>
            </div>
            
            <div class="section">
              <h2 class="section-title">
                <i class="ti ti-ticket"></i>
                Chi Tiết Vé
              </h2>
              ${data.tickets.map((ticket: any) => `
                <div class="ticket-card">
                  <div class="ticket-header">
                    <div class="ticket-name">${ticket.name}</div>
                    <div class="ticket-price">${ticket.price.toLocaleString('vi-VN')} VND</div>
                  </div>
                  <div class="ticket-details">
                    <div>Số lượng: <strong>${ticket.quantity}</strong></div>
                    <div>Đơn giá: <strong>${ticket.price.toLocaleString('vi-VN')} VND</strong></div>
                  </div>
                </div>
              `).join('')}
              
              <div class="total-section">
                <div class="total-row">
                  <span>Tổng cộng:</span>
                  <span>${data.orderInfo.totalAmount.toLocaleString('vi-VN')} VND</span>
                </div>
              </div>
            </div>
            
            <div class="pdf-notice">
              <div class="pdf-notice-title">📎 PDF Vé Điện Tử</div>
              <div class="pdf-notice-text">
                Vé điện tử đã được đính kèm trong email này. Mỗi vé có QR code riêng để check-in tại sự kiện.
              </div>
            </div>
            
            <div class="contact-info">
              <div class="contact-title">📞 Liên Hệ Hỗ Trợ</div>
              <div class="contact-item">💌 Email: ${data.organizationInfo?.contact_email || 'otconcert@gmail.com'}</div>
              <div class="contact-item">☎️ Phone: ${data.organizationInfo?.phone || '0934782703'}</div>
              ${data.organizationInfo?.website ? `
              <div class="contact-item">🌐 Website: ${data.organizationInfo.website}</div>
              ` : ''}
            </div>
          </div>
          
          <div class="footer">
            <p>Cảm ơn bạn đã sử dụng dịch vụ của ${data.organizationInfo?.name || 'Ớt Cay Xè Studio'}!</p>
            <p>Chúc bạn có một trải nghiệm tuyệt vời tại sự kiện.</p>
            <p style="margin-top: 16px; font-size: 12px; opacity: 0.6;">
              © 2024 ${data.organizationInfo?.name || 'Ớt Cay Xè Studio'} - The destination of Indie music
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
} 