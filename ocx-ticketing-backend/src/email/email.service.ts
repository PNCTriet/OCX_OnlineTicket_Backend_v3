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
            eventDate: order.event?.start_date ? order.event.start_date : null,
            eventTime: order.event?.start_date ? order.event.start_date : null,
            venue: order.event?.location || 'Địa điểm TBD',
            ticketType: orderItem.ticket.name,
            price: Number(orderItem.price),
            qrCode: code.code,
            organizationName: order.event?.organization?.name || 'Ớt Cay Xè',
            useTemplate: true, // Assuming all tickets use a template for now
          };

          const pdfBuffer = await this.generateTicketPDF(ticketData);
          
          // Tạo tên file PDF với format: [Người mua]_[Sự kiện]_[Loại vé]_[Số thứ tự].pdf
          const customerName = `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() || 'KhachHang';
          const eventName = order.event?.title || 'SuKien';
          const ticketType = orderItem.ticket.name || 'Ve';
          
          // Sanitize tên file (loại bỏ ký tự đặc biệt, dấu cách)
          const sanitizeFileName = (str: string) => {
            return str
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
              .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
              .replace(/\s+/g, '_') // Replace spaces with underscore
              .toUpperCase();
          };
          
          const pdfFilename = `${sanitizeFileName(customerName)}_${sanitizeFileName(eventName)}_${sanitizeFileName(ticketType)}_${ticketCounter}.pdf`;
          
          pdfAttachments.push({
            filename: pdfFilename,
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

      // Helper function to sanitize Vietnamese text for ASCII compatibility
      const sanitizeText = (text: string): string => {
        if (!text || typeof text !== 'string') return 'N/A';
        return text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
          .replace(/[Đđ]/g, 'D')
          .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
          .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
          .replace(/[ìíịỉĩ]/g, 'i')
          .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
          .replace(/[ùúụủũưừứựửữ]/g, 'u')
          .replace(/[ỳýỵỷỹ]/g, 'y')
          .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
          .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
          .replace(/[ÌÍỊỈĨ]/g, 'I')
          .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
          .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
          .replace(/[ỲÝỴỶỸ]/g, 'Y');
      };

      // Helper function to embed image from URL or base64
      const embedImage = async (imageUrl: string, pdfDoc: any) => {
        try {
          if (imageUrl.startsWith('data:')) {
            // Base64 image
            const base64Data = imageUrl.split(',')[1];
            const imageBytes = Buffer.from(base64Data, 'base64');
            return await pdfDoc.embedPng(imageBytes);
          } else if (imageUrl.startsWith('http')) {
            // URL image
            const response = await fetch(imageUrl);
            const imageBuffer = await response.arrayBuffer();
            return await pdfDoc.embedPng(imageBuffer);
          } else {
            // Local file path - check multiple directories
            const fs = require('fs');
            const path = require('path');
            
            // Check multiple possible paths for template
            const possiblePaths = [
              path.join(__dirname, 'template', imageUrl),
              path.join(__dirname, 'photo', imageUrl),
              path.join(__dirname, imageUrl),
              path.join(process.cwd(), 'src', 'email', 'template', imageUrl),
              path.join(process.cwd(), 'src', 'email', 'photo', imageUrl),
              path.join(process.cwd(), 'src', 'email', imageUrl),
              path.join(process.cwd(), 'template', imageUrl),
              path.join(process.cwd(), 'photo', imageUrl),
              path.join(process.cwd(), imageUrl),
              // Thêm đường dẫn từ dist folder (khi build)
              path.join(__dirname, '..', '..', 'src', 'email', 'template', imageUrl),
              path.join(__dirname, '..', '..', 'src', 'email', 'photo', imageUrl)
            ];
            
            let imagePath = null;
            for (let i = 0; i < possiblePaths.length; i++) {
              if (fs.existsSync(possiblePaths[i])) {
                imagePath = possiblePaths[i];
                break;
              }
            }
            
            if (imagePath) {
              const imageBuffer = fs.readFileSync(imagePath);
              
              // Check file extension to determine format
              const ext = path.extname(imageUrl).toLowerCase();
              if (ext === '.jpg' || ext === '.jpeg') {
                return await pdfDoc.embedJpg(imageBuffer);
              } else {
                return await pdfDoc.embedPng(imageBuffer);
              }
            }
          }
        } catch (error) {
          console.warn('Failed to embed image:', error);
          return null;
        }
        return null;
      };

      // Tạo PDF document với fontkit
      const { PDFDocument, rgb } = require('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      
      // Sử dụng font built-in để tránh lỗi
      const font = await pdfDoc.embedFont('Helvetica');
      const boldFont = await pdfDoc.embedFont('Helvetica-Bold');
      
      const page = pdfDoc.addPage([419.53, 595.28]); // A5 size in points (half of A4)

      // Embed background template nếu có
      let backgroundImage = null;
      if (ticketData.useTemplate) {
        try {
          backgroundImage = await embedImage('ETICKET_EN.jpg', pdfDoc);
          if (backgroundImage) {
            // Scale background to fit A5 page
            page.drawImage(backgroundImage, {
              x: 0,
              y: 0,
              width: 419.53,
              height: 595.28,
            });
          }
        } catch (error) {
          console.warn('Failed to embed background template:', error);
        }
      }

      // Chỉ giữ lại template background - không có header/background khác

      // Embed QR code image
      const base64Data = qrCodeDataUrl.split(',')[1];
      const imageBytes = Buffer.from(base64Data, 'base64');
      const image = await pdfDoc.embedPng(imageBytes);

      // Scale và position QR code - điều chỉnh cho A5
      const qrScale = 0.5; // Scale từ test file
      const { width, height } = image.scale(qrScale);
      const qrX = 254; // Vị trí A5: 360 * 0.705
      const qrY = 106; // Vị trí A5: 150 * 0.705
      
      // Để di chuyển QR code:
      // - Lên trên: tăng qrY (ví dụ: 500 -> 600)
      // - Xuống dưới: giảm qrY (ví dụ: 500 -> 300)
      // - Sang trái: giảm qrX (ví dụ: 200 -> 100)
      // - Sang phải: tăng qrX (ví dụ: 200 -> 300)

      // Draw QR code - chỉ vẽ QR code, không có background hay label
      page.drawImage(image, {
        x: qrX,
        y: qrY,
        width,
        height,
      });

      // Không cần event image - chỉ giữ template và 4 thông tin chính

      // Ticket information section - chỉ hiển thị 4 thông tin cần thiết
      // Các vị trí có thể tùy chỉnh riêng cho từng thông tin
      const ticketInfo = [
        {
          // Giờ tổ chức: format "16:00 - 22:00" với 2 giờ nằm dọc thẳng hàng
          value: ticketData.eventTime ? (() => {
            const eventDate = new Date(ticketData.eventTime);
            const hour = eventDate.getHours();
            const minute = eventDate.getMinutes().toString().padStart(2, '0');
            const endHour = hour + 7;
            return `${hour}:${minute} - ${endHour}:${minute}`;
          })() : 'N/A',
          x: 80,   // Vị trí A5: 105 * 0.705
          y: 275,  // Vị trí A5: 390 * 0.705
          size: 25, // Kích thước font A5: 35 * 0.705
          color: backgroundImage ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3),
          isTime: true // Đánh dấu để format đặc biệt
        },
        {
          // Ngày tổ chức: format "28 SEPTEMBER" với số và tháng có vị trí riêng
          value: ticketData.eventDate ? (() => {
            const eventDate = new Date(ticketData.eventDate);
            const day = eventDate.getDate();
            const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                              'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
            const month = monthNames[eventDate.getMonth()];
            return { day: day.toString(), month: month };
          })() : { day: 'N/A', month: 'N/A' },
          x: 170,   // Vị trí A5: 230 * 0.705
          y: 282,  // Vị trí A5: 400 * 0.705
          size: 18, // Kích thước font A5: 25 * 0.705
          color: backgroundImage ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3),
          isDate: true, // Đánh dấu để format đặc biệt
          // Vị trí riêng cho số và tháng từ test file
          dayX: 195, // Vị trí X của số A5: 270 * 0.705
          dayY: 282, // Vị trí Y của số A5: 400 * 0.705
          monthX: 170, // Vị trí X của tháng A5: 240 * 0.705
          monthY: 260, // Vị trí Y của tháng A5: 380 * 0.705
          daySize: 35, // Kích thước font của số A5: 50 * 0.705
          monthSize: 14 // Kích thước font của tháng A5: 20 * 0.705
        },
        {
          // Loại vé: in đậm
          value: sanitizeText(ticketData.ticketType) || 'N/A',
          x: 295,   // Vị trí A5: 410 * 0.705
          y: 275,  // Vị trí A5: 390 * 0.705
          size: 25, // Kích thước font A5: 35 * 0.705
          color: backgroundImage ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3),
          isBold: true // Đánh dấu để in đậm
        },
        {
          // Người sở hữu
          value: sanitizeText(ticketData.customerName) || 'N/A',
          x: 141,   // Vị trí A5: 200 * 0.705
          y: 212,  // Vị trí A5: 300 * 0.705
          size: 10, // Kích thước font A5: 14 * 0.705
          color: backgroundImage ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3)
        }
      ];

      // Vẽ từng thông tin với format đặc biệt - giống hệt test file
      ticketInfo.forEach(info => {
        if (info.isTime) {
          // Format giờ với 2 giờ nằm dọc thẳng hàng
          const timeParts = info.value.split(' - ');
          if (timeParts.length === 2) {
            // Vẽ giờ bắt đầu (trên)
            page.drawText(timeParts[0], {
              x: info.x,
              y: info.y + 15, // Giờ trên
              size: info.size,
              font: boldFont,
              color: info.color,
            });
            
            // Vẽ giờ kết thúc (dưới)
            page.drawText(timeParts[1], {
              x: info.x, // Cùng vị trí X để thẳng hàng
              y: info.y - 15, // Giờ dưới
              size: info.size,
              font: boldFont,
              color: info.color,
            });
          } else {
            // Fallback nếu không parse được
            page.drawText(info.value, {
              x: info.x,
              y: info.y,
              size: info.size,
              font: boldFont,
              color: info.color,
            });
          }
        } else if (info.isDate) {
          // Format ngày với số in đậm và tháng ở dưới
          page.drawText(info.value.day, {
            x: info.dayX,
            y: info.dayY,
            size: info.daySize,
            font: boldFont,
            color: info.color,
          });
          
          page.drawText(info.value.month, {
            x: info.monthX,
            y: info.monthY,
            size: info.monthSize,
            font,
            color: info.color,
          });
        } else {
          // Format thông thường
          page.drawText(info.value, {
            x: info.x,
            y: info.y,
            size: info.size,
            font: info.isBold ? boldFont : font,
            color: info.color,
          });
        }
      });

      // Chỉ giữ lại layout chính như test file - không có thông tin debug

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