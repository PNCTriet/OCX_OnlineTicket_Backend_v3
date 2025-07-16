import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [AuthModule, UsersModule, OrganizationsModule, EventsModule, TicketsModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
