import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QRService } from './qr.service';

@Injectable()
export class CheckinService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qrService: QRService,
  ) {}

  // Verify QR code và check-in
  async checkInWithQR(qrDataString: string, checkedBy: string) {
    try {
      // Verify QR code data
      const verification = this.qrService.verifyQRData(qrDataString);
      
      if (!verification.isValid) {
        throw new BadRequestException(`Invalid QR code: ${verification.error}`);
      }

      const qrData = verification.data;
      
      // Kiểm tra order tồn tại và có trạng thái hợp lệ
      const order = await this.prisma.order.findUnique({
        where: { id: qrData.orderId },
        include: {
          order_items: {
            where: { id: qrData.orderItemId },
            include: {
              ticket: {
                include: {
                  event: true,
                },
              },
            },
          },
          event: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== 'PAID') {
        throw new BadRequestException('Order must be paid before check-in');
      }

      const orderItem = order.order_items[0];
      if (!orderItem) {
        throw new NotFoundException('Order item not found');
      }

      // Kiểm tra đã check-in chưa
      const existingCheckin = await this.prisma.checkinLog.findFirst({
        where: {
          order_id: qrData.orderId,
          order_item_id: qrData.orderItemId,
        },
      });

      if (existingCheckin) {
        throw new BadRequestException('Ticket has already been checked in');
      }

      // Kiểm tra event date
      const event = orderItem.ticket.event;
      const now = new Date();
      const eventDate = new Date(event.start_date);
      
      // Cho phép check-in trong khoảng 2 giờ trước event
      const checkInStartTime = new Date(eventDate.getTime() - 2 * 60 * 60 * 1000);
      const checkInEndTime = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);

      if (now < checkInStartTime) {
        throw new BadRequestException('Check-in is not available yet. Please wait until 2 hours before the event.');
      }

      if (now > checkInEndTime) {
        throw new BadRequestException('Check-in period has expired.');
      }

      // Tạo check-in log
      const checkinLog = await this.prisma.checkinLog.create({
        data: {
          user_id: order.user_id,
          ticket_id: qrData.ticketId,
          event_id: event.id,
          order_id: qrData.orderId,
          order_item_id: qrData.orderItemId,
          checkin_time: now,
          verified_by: checkedBy,
          notes: `QR Code verified: ${qrData.hash}`,
        },
      });

      return {
        success: true,
        message: 'Check-in successful',
        data: {
          orderId: qrData.orderId,
          ticketName: orderItem.ticket.name,
          eventName: event.title,
          checkinTime: checkinLog.checkin_time,
          verifiedBy: checkedBy,
        },
      };
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  }

  // Lấy danh sách check-in logs
  async getCheckinLogs(eventId?: string, orderId?: string) {
    const where: any = {};
    
    if (eventId) {
      where.event_id = eventId;
    }
    
    if (orderId) {
      where.order_id = orderId;
    }

    return this.prisma.checkinLog.findMany({
      where,
      include: {
        user: true,
        ticket: true,
        event: true,
      },
      orderBy: {
        checkin_time: 'desc',
      },
    });
  }

  // Thống kê check-in
  async getCheckinStats(eventId: string) {
    const totalTickets = await this.prisma.orderItem.aggregate({
      where: {
        order: {
          event_id: eventId,
          status: 'PAID',
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const checkedInTickets = await this.prisma.checkinLog.count({
      where: {
        event_id: eventId,
      },
    });

    return {
      eventId,
      totalTickets: totalTickets._sum.quantity || 0,
      checkedInTickets,
      remainingTickets: (totalTickets._sum.quantity || 0) - checkedInTickets,
      checkinRate: totalTickets._sum.quantity ? 
        ((checkedInTickets / totalTickets._sum.quantity) * 100).toFixed(2) + '%' : '0%',
    };
  }
} 