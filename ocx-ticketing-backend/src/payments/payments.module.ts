import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaModule } from '../prisma.module';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/orders.module';
import { EmailModule } from '../email/email.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, AuthModule, OrdersModule, EmailModule, EventsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {} 