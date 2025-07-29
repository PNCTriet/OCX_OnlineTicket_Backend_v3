import { Module } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { EventsController } from '../events/events.controller';
import { EventSettingsService } from './event-settings.service';
import { EventSettingsController } from './event-settings.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EventsService, EventSettingsService],
  controllers: [EventsController, EventSettingsController],
  exports: [EventsService, EventSettingsService],
})
export class EventsModule {} 