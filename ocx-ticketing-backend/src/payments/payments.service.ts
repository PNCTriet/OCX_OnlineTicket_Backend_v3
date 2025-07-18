import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentStatus, OrderStatus } from '@prisma/client';

interface SepayWebhookData {
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: string | null;
  code: string;
  content: string;
  transferType: string;
  description: string;
  transferAmount: number;
  referenceCode: string;
  accumulated: number;
  id: number;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  // Xử lý Sepay webhook
  async handleSepayWebhook(webhookData: SepayWebhookData) {
    try {
      console.log('Processing Sepay webhook:', webhookData);

      // 1. Tìm order dựa trên content hoặc amount
      const order = await this.findOrderByPaymentInfo(webhookData);
      
      if (!order) {
        // Tạo payment record nhưng chưa match với order
        const payment = await this.prisma.payment.create({
          data: {
            order_id: '', // Sẽ update sau khi match
            amount: webhookData.transferAmount,
            currency: 'VND',
            payment_method: 'sepay',
            status: PaymentStatus.PENDING,
            transaction_id: webhookData.referenceCode,
            gateway: webhookData.gateway,
            transaction_date: new Date(webhookData.transactionDate),
            account_number: webhookData.accountNumber,
            sub_account: webhookData.subAccount,
            code: webhookData.code,
            content: webhookData.content,
            transfer_type: webhookData.transferType,
            description: webhookData.description,
            reference_code: webhookData.referenceCode,
            accumulated: webhookData.accumulated,
            sepay_id: webhookData.id,
          },
        });

        return {
          success: true,
          message: 'Payment received but no matching order found',
          payment_id: payment.id,
        };
      }

      // 2. Tạo payment record
      const payment = await this.prisma.payment.create({
        data: {
          order_id: order.id,
          amount: webhookData.transferAmount,
          currency: 'VND',
          payment_method: 'sepay',
          status: PaymentStatus.SUCCESS,
          transaction_id: webhookData.referenceCode,
          gateway: webhookData.gateway,
          transaction_date: new Date(webhookData.transactionDate),
          account_number: webhookData.accountNumber,
          sub_account: webhookData.subAccount,
          code: webhookData.code,
          content: webhookData.content,
          transfer_type: webhookData.transferType,
          description: webhookData.description,
          reference_code: webhookData.referenceCode,
          accumulated: webhookData.accumulated,
          sepay_id: webhookData.id,
        },
      });

      // 3. Update order status
      await this.prisma.order.update({
        where: { id: order.id },
        data: { 
          status: OrderStatus.PAID,
          paid_at: new Date(),
        },
      });

      return {
        success: true,
        message: 'Payment processed successfully',
        order_id: order.id,
        payment_id: payment.id,
      };

    } catch (error) {
      console.error('Error processing Sepay webhook:', error);
      throw new BadRequestException('Failed to process payment webhook');
    }
  }

  // Tìm order dựa trên thông tin payment
  private async findOrderByPaymentInfo(webhookData: SepayWebhookData) {
    // Strategy 1: Tìm theo content pattern (nếu có order ID trong content)
    const orderIdMatch = webhookData.content.match(/OCX(\w+)/);
    if (orderIdMatch) {
      const orderId = orderIdMatch[1];
      const orderById = await this.prisma.order.findUnique({
        where: { 
          id: orderId,
          status: OrderStatus.PENDING,
        },
      });
      
      if (orderById && Number(orderById.total_amount) === webhookData.transferAmount) {
        console.log(`Found order by ID in content: ${orderId}`);
        return orderById;
      }
    }

    // Strategy 2: Tìm theo amount + thời gian gần đây + user info
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pendingOrders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        total_amount: webhookData.transferAmount,
        created_at: {
          gte: twentyFourHoursAgo,
        },
      },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Strategy 3: Tìm theo amount + thời gian gần nhất (trong 30 phút)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentOrder = pendingOrders.find(order => 
      order.created_at >= thirtyMinutesAgo
    );

    if (recentOrder) {
      console.log(`Found recent order by amount + time: ${recentOrder.id}`);
      return recentOrder;
    }

    // Strategy 4: Nếu có nhiều orders cùng amount, ưu tiên order gần nhất
    if (pendingOrders.length > 0) {
      console.log(`Found ${pendingOrders.length} orders with same amount, using most recent`);
      return pendingOrders[0]; // Đã sort theo created_at desc
    }

    // Strategy 5: Tìm theo user info nếu có trong content
    const userEmailMatch = webhookData.content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (userEmailMatch) {
      const userEmail = userEmailMatch[1];
      const orderByEmail = pendingOrders.find(order => 
        order.user.email === userEmail
      );
      
      if (orderByEmail) {
        console.log(`Found order by user email: ${userEmail}`);
        return orderByEmail;
      }
    }

    console.log('No matching order found for payment');
    return null;
  }

  // Lấy thông tin payment theo order
  async getPaymentByOrder(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { order_id: orderId },
      include: {
        order: {
          select: {
            id: true,
            total_amount: true,
            status: true,
            created_at: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this order');
    }

    return payment;
  }

  // Match payment với order thủ công
  async matchPaymentWithOrder(orderId: string) {
    // Tìm order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Tìm payment chưa match
    const unmatchedPayment = await this.prisma.payment.findFirst({
      where: {
        order_id: '',
        status: PaymentStatus.PENDING,
        amount: order.total_amount,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!unmatchedPayment) {
      throw new NotFoundException('No unmatched payment found for this order');
    }

    // Update payment với order_id
    const updatedPayment = await this.prisma.payment.update({
      where: { id: unmatchedPayment.id },
      data: {
        order_id: orderId,
        status: PaymentStatus.SUCCESS,
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
        paid_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Payment matched successfully',
      payment: updatedPayment,
      order_id: orderId,
    };
  }

  // Lấy danh sách payments chưa match
  async getUnmatchedPayments(limit: number = 50, offset: number = 0) {
    const payments = await this.prisma.payment.findMany({
      where: {
        order_id: '',
        status: PaymentStatus.PENDING,
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.payment.count({
      where: {
        order_id: '',
        status: PaymentStatus.PENDING,
      },
    });

    return {
      payments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  // Lấy danh sách orders đang pending
  async getPendingOrders(limit: number = 50, offset: number = 0) {
    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
      },
      include: {
                  user: {
            select: {
              email: true,
              phone: true,
            },
          },
        organization: {
          select: {
            name: true,
          },
        },
        event: {
          select: {
            title: true,
            start_date: true,
          },
        },
        order_items: {
          include: {
            ticket: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.order.count({
      where: {
        status: OrderStatus.PENDING,
      },
    });

    return {
      orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }
} 