import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEventDto) {
    return this.prisma.event.create({ data: {
      ...data,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
    }});
  }

  async findAll() {
    return this.prisma.event.findMany();
  }

  async findByOrganization(organization_id: string) {
    return this.prisma.event.findMany({
      where: { organization_id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logo_url: true,
          },
        },
        tickets: {
          select: {
            id: true,
            name: true,
            price: true,
            total_qty: true,
            sold_qty: true,
            status: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.event.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateEventDto) {
    return this.prisma.event.update({
      where: { id },
      data: {
        ...data,
        start_date: data.start_date ? new Date(data.start_date) : undefined,
        end_date: data.end_date ? new Date(data.end_date) : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.event.delete({ where: { id } });
  }
} 