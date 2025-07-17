import { Module } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { EventsController } from '../events/events.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {} 