import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { CheckinController } from './checkin.controller';
import { OrdersService } from './orders.service';
import { QRService } from './qr.service';
import { CheckinService } from './checkin.service';
import { PrismaModule } from '../prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { OrderItemCodeController } from './order-item-code.controller';
import { OrderItemCodeService } from './order-item-code.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController, CheckinController, OrderItemCodeController],
  providers: [OrdersService, QRService, CheckinService, OrderItemCodeService],
  exports: [OrdersService, QRService, CheckinService],
})
export class OrdersModule {}
