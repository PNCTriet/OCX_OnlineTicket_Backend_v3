import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrderItemCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orderItemId?: string) {
    return this.prisma.orderItemCode.findMany({
      where: orderItemId ? { order_item_id: orderItemId } : {},
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const code = await this.prisma.orderItemCode.findUnique({ where: { id } });
    if (!code) throw new NotFoundException('OrderItemCode not found');
    return code;
  }

  async update(id: string, data: any) {
    return this.prisma.orderItemCode.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.orderItemCode.delete({ where: { id } });
    return { message: 'OrderItemCode deleted successfully' };
  }
} 