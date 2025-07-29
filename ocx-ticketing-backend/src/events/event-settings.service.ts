import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface EventSettings {
  auto_send_confirm_email: boolean;
  auto_send_ticket_email: boolean;
}

@Injectable()
export class EventSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy settings của event
  async getEventSettings(eventId: string): Promise<EventSettings> {
    const settings = await this.prisma.eventSetting.findMany({
      where: { event_id: eventId },
    });

    const defaultSettings: EventSettings = {
      auto_send_confirm_email: false,
      auto_send_ticket_email: false,
    };

    // Map settings từ database
    settings.forEach(setting => {
      if (setting.setting_key === 'auto_send_confirm_email') {
        defaultSettings.auto_send_confirm_email = setting.setting_value === 'true';
      }
      if (setting.setting_key === 'auto_send_ticket_email') {
        defaultSettings.auto_send_ticket_email = setting.setting_value === 'true';
      }
    });

    return defaultSettings;
  }

  // Cập nhật settings của event
  async updateEventSettings(eventId: string, settings: Partial<EventSettings>): Promise<EventSettings> {
    // Kiểm tra event tồn tại
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    // Cập nhật từng setting
    for (const [key, value] of Object.entries(settings)) {
      await this.prisma.eventSetting.upsert({
        where: {
          event_id_setting_key: {
            event_id: eventId,
            setting_key: key,
          },
        },
        update: {
          setting_value: value.toString(),
          updated_at: new Date(),
        },
        create: {
          event_id: eventId,
          setting_key: key,
          setting_value: value.toString(),
        },
      });
    }

    return this.getEventSettings(eventId);
  }

  // Kiểm tra xem có nên gửi confirm email tự động không
  async shouldSendConfirmEmail(eventId: string): Promise<boolean> {
    const settings = await this.getEventSettings(eventId);
    return settings.auto_send_confirm_email && !settings.auto_send_ticket_email;
  }

  // Kiểm tra xem có nên gửi ticket email tự động không
  async shouldSendTicketEmail(eventId: string): Promise<boolean> {
    const settings = await this.getEventSettings(eventId);
    return settings.auto_send_ticket_email;
  }
} 