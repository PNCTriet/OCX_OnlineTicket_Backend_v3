import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderStatus } from '@prisma/client';

interface OrderItemData {
  ticket_id: string;
  quantity: number;
  price: any; // Decimal type from Prisma
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

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
          reserved_until: new Date(Date.now() + 15 * 60 * 1000), // 15 phút
        },
      });

      // Tạo order items
      for (const item of orderItems) {
        await prisma.orderItem.create({
          data: {
            order_id: newOrder.id,
            ticket_id: item.ticket_id,
            quantity: item.quantity,
            price: item.price,
          },
        });

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

      return newOrder;
    });

    return order;
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
          },
        },
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

  async getAllOrders(user_id?: string) {
    const where = user_id ? { user_id } : {};
    
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
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
