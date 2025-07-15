import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTicketDto) {
    return this.prisma.ticket.create({ data: {
      ...data,
      price: Number(data.price),
      total_qty: Number(data.total_qty),
      sale_start: data.sale_start ? new Date(data.sale_start) : undefined,
      sale_end: data.sale_end ? new Date(data.sale_end) : undefined,
    }});
  }

  async findAll() {
    return this.prisma.ticket.findMany();
  }

  async findOne(id: string) {
    return this.prisma.ticket.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateTicketDto) {
    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...data,
        price: data.price !== undefined ? Number(data.price) : undefined,
        total_qty: data.total_qty !== undefined ? Number(data.total_qty) : undefined,
        sale_start: data.sale_start ? new Date(data.sale_start) : undefined,
        sale_end: data.sale_end ? new Date(data.sale_end) : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.ticket.delete({ where: { id } });
  }

  async findByEvent(event_id: string) {
    return this.prisma.ticket.findMany({ where: { event_id } });
  }
} 