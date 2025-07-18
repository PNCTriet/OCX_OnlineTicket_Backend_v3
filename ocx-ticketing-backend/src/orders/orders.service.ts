import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderStatus, OrderItem } from '@prisma/client';
import { UserRole } from '../auth/roles.enum';
import { PaymentStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QRService } from './qr.service';

interface OrderItemData {
  ticket_id: string;
  quantity: number;
  price: any; // Decimal type from Prisma
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qrService: QRService,
  ) {}

  async createOrder(data: {
    user_id: string;
    organization_id: string;
    event_id?: string;
    items: Array<{
      ticket_id: string;
      quantity: number;
    }>;
  }) {
    // Kiểm tra tồn kho và tính tổng tiền
    let totalAmount = 0;
    const orderItems: OrderItemData[] = [];

    for (const item of data.items) {
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: item.ticket_id },
      });

      if (!ticket) {
        throw new NotFoundException(`Ticket ${item.ticket_id} not found`);
      }

      if (ticket.status !== 'ACTIVE') {
        throw new BadRequestException(`Ticket ${ticket.name} is not active`);
      }

      if (ticket.total_qty - ticket.sold_qty < item.quantity) {
        throw new BadRequestException(`Insufficient tickets for ${ticket.name}`);
      }

      totalAmount += Number(ticket.price) * item.quantity;
      orderItems.push({
        ticket_id: item.ticket_id,
        quantity: item.quantity,
        price: ticket.price,
      });
    }

    // Tạo order với transaction để đảm bảo consistency
    const order = await this.prisma.$transaction(async (prisma) => {
      // Tạo order
      const newOrder = await prisma.order.create({
        data: {
          user_id: data.user_id,
          organization_id: data.organization_id,
          event_id: data.event_id,
          total_amount: totalAmount,
          status: OrderStatus.PENDING,
          reserved_until: new Date(Date.now() + 10 * 60 * 1000), // 10 phút
        },
      });

      // Tạo order items (KHÔNG sinh QR code ở đây)
      const createdOrderItems: OrderItem[] = [];
      for (const item of orderItems) {
        const createdOrderItem = await prisma.orderItem.create({
          data: {
            order_id: newOrder.id,
            ticket_id: item.ticket_id,
            quantity: item.quantity,
            price: item.price,
          },
        });
        createdOrderItems.push(createdOrderItem);
        // Cập nhật số lượng đã bán
        await prisma.ticket.update({
          where: { id: item.ticket_id },
          data: {
            sold_qty: {
              increment: item.quantity,
            },
          },
        });
      }
      return { order: newOrder, orderItems: createdOrderItems };
    });

    // Đảm bảo không còn logic cập nhật qr_code nào nữa
    return {
      ...order.order,
      qrCodes: [], // Trả về một mảng rỗng vì không còn mã QR
    };
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        organization: true,
        event: true,
        order_items: {
          include: {
            ticket: true,
            codes: true, // Trả về danh sách mã QR cho từng order_item
          },
        },
        payments: true, // Bổ sung payments
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async cancelOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        order_items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.RESERVED) {
      throw new BadRequestException(`Cannot cancel order with status ${order.status}`);
    }

    // Hoàn trả số lượng vé và cập nhật trạng thái
    await this.prisma.$transaction(async (prisma) => {
      // Hoàn trả số lượng vé
      for (const item of order.order_items) {
        await prisma.ticket.update({
          where: { id: item.ticket_id },
          data: {
            sold_qty: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Cập nhật trạng thái order
      await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });
    });

    return { message: 'Order cancelled successfully' };
  }

  async getAllOrders(user_id?: string, role?: UserRole) {
    let where = {};
    
    // Logic phân quyền
    if (role === UserRole.USER) {
      // USER chỉ xem order của mình
      where = { user_id };
    } else if (role === UserRole.ADMIN_ORGANIZER || role === UserRole.OWNER_ORGANIZER || role === UserRole.SUPERADMIN) {
      // ADMIN/OWNER/SUPERADMIN xem tất cả order (có thể thêm filter theo organization sau)
      where = {};
    } else {
      // Mặc định USER nếu không có role
      where = { user_id };
    }
    
    return this.prisma.order.findMany({
      where,
      include: {
        user: true,
        organization: true,
        event: true,
        order_items: {
          include: {
            ticket: true,
          },
        },
        payments: true, // Bổ sung payments
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // CRUD cho Order Items
  async getOrderItems(orderId: string) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { order_id: orderId },
      include: {
        ticket: true,
      },
    });

    if (!orderItems.length) {
      throw new NotFoundException(`No order items found for order ${orderId}`);
    }

    return orderItems;
  }

  async createOrderItem(orderId: string, data: {
    ticket_id: string;
    quantity: number;
  }) {
    // Kiểm tra order tồn tại
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Kiểm tra ticket tồn tại và có đủ số lượng
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: data.ticket_id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket ${data.ticket_id} not found`);
    }

    if (ticket.status !== 'ACTIVE') {
      throw new BadRequestException(`Ticket ${ticket.name} is not active`);
    }

    if (ticket.total_qty - ticket.sold_qty < data.quantity) {
      throw new BadRequestException(`Insufficient tickets for ${ticket.name}`);
    }

    // Tạo order item với transaction
    const orderItem = await this.prisma.$transaction(async (prisma) => {
      // Tạo order item
      const newOrderItem = await prisma.orderItem.create({
        data: {
          order_id: orderId,
          ticket_id: data.ticket_id,
          quantity: data.quantity,
          price: ticket.price,
        },
        include: {
          ticket: true,
        },
      });

      // Cập nhật số lượng đã bán
      await prisma.ticket.update({
        where: { id: data.ticket_id },
        data: {
          sold_qty: {
            increment: data.quantity,
          },
        },
      });

      // Cập nhật tổng tiền order
      const totalAmount = Number(order.total_amount) + (Number(ticket.price) * data.quantity);
      await prisma.order.update({
        where: { id: orderId },
        data: {
          total_amount: totalAmount,
        },
      });

      return newOrderItem;
    });

    return orderItem;
  }

  async updateOrderItem(orderId: string, itemId: string, data: {
    quantity?: number;
  }) {
    // Kiểm tra order item tồn tại
    const orderItem = await this.prisma.orderItem.findFirst({
      where: { 
        id: itemId,
        order_id: orderId,
      },
      include: {
        ticket: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException(`Order item ${itemId} not found`);
    }

    // Nếu có thay đổi quantity
    if (data.quantity && data.quantity !== orderItem.quantity) {
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: orderItem.ticket_id },
      });

      if (!ticket) {
        throw new NotFoundException(`Ticket ${orderItem.ticket_id} not found`);
      }

      const quantityDiff = data.quantity - orderItem.quantity;
      
      if (ticket.total_qty - ticket.sold_qty < quantityDiff) {
        throw new BadRequestException(`Insufficient tickets for ${ticket.name}`);
      }

      // Cập nhật với transaction
      const updatedOrderItem = await this.prisma.$transaction(async (prisma) => {
        // Cập nhật order item
        const updated = await prisma.orderItem.update({
          where: { id: itemId },
          data: {
            quantity: data.quantity,
          },
          include: {
            ticket: true,
          },
        });

        // Cập nhật số lượng đã bán
        await prisma.ticket.update({
          where: { id: orderItem.ticket_id },
          data: {
            sold_qty: {
              increment: quantityDiff,
            },
          },
        });

        // Cập nhật tổng tiền order
        const order = await prisma.order.findUnique({
          where: { id: orderId },
        });

        if (order) {
          const totalAmount = Number(order.total_amount) + (Number(ticket.price) * quantityDiff);
          await prisma.order.update({
            where: { id: orderId },
            data: {
              total_amount: totalAmount,
            },
          });
        }

        return updated;
      });

      return updatedOrderItem;
    }

    return orderItem;
  }

  async deleteOrderItem(orderId: string, itemId: string) {
    // Kiểm tra order item tồn tại
    const orderItem = await this.prisma.orderItem.findFirst({
      where: { 
        id: itemId,
        order_id: orderId,
      },
      include: {
        ticket: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException(`Order item ${itemId} not found`);
    }

    // Xóa với transaction
    await this.prisma.$transaction(async (prisma) => {
      // Xóa order item
      await prisma.orderItem.delete({
        where: { id: itemId },
      });

      // Hoàn trả số lượng đã bán
      await prisma.ticket.update({
        where: { id: orderItem.ticket_id },
        data: {
          sold_qty: {
            decrement: orderItem.quantity,
          },
        },
      });

      // Cập nhật tổng tiền order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (order) {
        const totalAmount = Number(order.total_amount) - (Number(orderItem.price) * orderItem.quantity);
        await prisma.order.update({
          where: { id: orderId },
          data: {
            total_amount: totalAmount,
          },
        });
      }
    });

    return { message: 'Order item deleted successfully' };
  }

  // CRUD cho Payments
  async getOrderPayments(orderId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { order_id: orderId },
    });

    if (!payments.length) {
      throw new NotFoundException(`No payments found for order ${orderId}`);
    }

    return payments;
  }

  async createPayment(orderId: string, data: any) {
    // Tạo payment record với đủ trường như Sepay webhook
    const payment = await this.prisma.payment.create({
      data: {
        order_id: orderId,
        amount: data.amount,
        currency: data.currency || 'VND',
        payment_method: data.payment_method,
        status: data.status,
        transaction_id: data.transaction_id,
        gateway: data.gateway,
        transaction_date: data.transactionDate ? new Date(data.transactionDate) : undefined,
        account_number: data.accountNumber,
        sub_account: data.subAccount,
        code: data.code,
        content: data.content,
        transfer_type: data.transferType,
        description: data.description,
        transfer_amount: data.transferAmount,
        reference_code: data.referenceCode,
        accumulated: data.accumulated,
        sepay_id: data.sepay_id,
      },
    });

    // Nếu status là SUCCESS thì update order sang PAID và sinh mã QR code
    if (data.status === 'SUCCESS') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paid_at: new Date(),
          reserved_until: null,
        },
      });
      await this.generateOrderItemCodesForOrder(orderId);
    }

    return payment;
  }
  

  async updatePayment(orderId: string, paymentId: string, data: {
    amount?: number;
    payment_method?: string;
    transaction_id?: string;
    status?: string;
  }) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, order_id: orderId },
    });
  
    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }
  
    const updateData: any = {
      amount: data.amount,
      payment_method: data.payment_method,
      transaction_id: data.transaction_id,
    };
  
    if (data.status) {
      if (!isValidPaymentStatus(data.status)) {
        throw new BadRequestException(`Invalid payment status: ${data.status}`);
      }
      updateData.status = data.status as PaymentStatus;
    }
  
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
    });
  
    return updatedPayment;
  }
  

  async deletePayment(orderId: string, paymentId: string) {
    // Kiểm tra payment tồn tại
    const payment = await this.prisma.payment.findFirst({
      where: { 
        id: paymentId,
        order_id: orderId,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    // Xóa payment
    await this.prisma.payment.delete({
      where: { id: paymentId },
    });

    return { message: 'Payment deleted successfully' };
  }

  // Tự động expire orders hết hạn
  async expireExpiredOrders() {
    const now = new Date();
    
    // Tìm tất cả orders PENDING/RESERVED đã hết hạn
    const expiredOrders = await this.prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.PENDING, OrderStatus.RESERVED],
        },
        reserved_until: {
          lt: now,
        },
      },
      include: {
        order_items: true,
      },
    });

    console.log(`Found ${expiredOrders.length} expired orders to process`);

    // Xử lý từng expired order
    for (const order of expiredOrders) {
      await this.prisma.$transaction(async (prisma) => {
        // Hoàn trả số lượng vé
        for (const item of order.order_items) {
          await prisma.ticket.update({
            where: { id: item.ticket_id },
            data: {
              sold_qty: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Cập nhật trạng thái order thành EXPIRED
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.EXPIRED,
          },
        });

        console.log(`Expired order ${order.id} and returned ${order.order_items.length} ticket types`);
      });
    }

    return {
      message: `Processed ${expiredOrders.length} expired orders`,
      expiredCount: expiredOrders.length,
    };
  }

  // Kiểm tra order có hết hạn không
  async checkOrderExpiration(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.status === OrderStatus.PENDING || order.status === OrderStatus.RESERVED) {
      const now = new Date();
      const isExpired = order.reserved_until && order.reserved_until < now;
      
      if (isExpired) {
        // Tự động expire order này
        await this.expireExpiredOrders();
        return {
          isExpired: true,
          message: 'Order has expired and tickets have been returned',
        };
      }
    }

    return {
      isExpired: false,
      reservedUntil: order.reserved_until,
    };
  }

  // Hàm sinh order_item_code cho order đã PAID
  async generateOrderItemCodesForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { order_items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    for (const item of order.order_items) {
      // Nếu đã có code rồi thì bỏ qua
      const existingCodes = await this.prisma.orderItemCode.count({ where: { order_item_id: item.id } });
      if (existingCodes >= item.quantity) continue;
      for (let i = existingCodes; i < item.quantity; i++) {
        const qrData = this.qrService['generateQRData'](
          order.id,
          item.id,
          item.ticket_id,
          1
        );
        const code = JSON.parse(qrData).hash;
        await this.prisma.orderItemCode.create({
          data: {
            order_item_id: item.id,
            code,
            used: false,
            created_at: new Date(),
            active: true,
          },
        });
      }
    }
  }

  // Scheduled task: Tự động expire orders mỗi 5 phút
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredOrders() {
    try {
      console.log('Running scheduled task: Checking for expired orders...');
      const result = await this.expireExpiredOrders();
      console.log(`Scheduled task completed: ${result.message}`);
    } catch (error) {
      console.error('Error in scheduled task for expired orders:', error);
    }
  }
}

function isValidPaymentStatus(status: string): status is PaymentStatus {
  return Object.values(PaymentStatus).includes(status as PaymentStatus);
}