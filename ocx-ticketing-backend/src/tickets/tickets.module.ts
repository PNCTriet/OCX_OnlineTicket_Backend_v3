import { Module } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
import { TicketsController } from '../tickets/tickets.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TicketsService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {} 