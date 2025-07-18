import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { CheckinController } from './checkin.controller';
import { OrdersService } from './orders.service';
import { QRService } from './qr.service';
import { CheckinService } from './checkin.service';
import { PrismaModule } from '../prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [OrdersController, CheckinController],
  providers: [OrdersService, QRService, CheckinService],
  exports: [OrdersService, QRService, CheckinService],
})
export class OrdersModule {}
