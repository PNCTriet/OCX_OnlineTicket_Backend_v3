import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { EventSettingsService, EventSettings } from './event-settings.service';
import { UpdateEventSettingsDto } from './dto/update-event-settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard, Roles } from '../auth/role.guard';
import { UserRole } from '@prisma/client';

@ApiTags('event-settings')
@Controller('events/:eventId/settings')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
@ApiBearerAuth()
export class EventSettingsController {
  constructor(private readonly eventSettingsService: EventSettingsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Lấy cài đặt email tự động cho event',
    description: 'Lấy cài đặt auto send confirm email và ticket email cho event'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Event settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        auto_send_confirm_email: {
          type: 'boolean',
          description: 'Tự động gửi email xác nhận khi thanh toán thành công'
        },
        auto_send_ticket_email: {
          type: 'boolean',
          description: 'Tự động gửi email vé điện tử khi thanh toán thành công'
        }
      },
      example: {
        auto_send_confirm_email: true,
        auto_send_ticket_email: false
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getEventSettings(@Param('eventId') eventId: string): Promise<EventSettings> {
    return this.eventSettingsService.getEventSettings(eventId);
  }

  @Put()
  @ApiOperation({ 
    summary: 'Cập nhật cài đặt email tự động cho event',
    description: 'Cập nhật cài đặt auto send confirm email và ticket email cho event. Logic: Nếu auto_send_ticket_email = true thì sẽ gửi ticket email tự động và bỏ qua confirm email. Nếu auto_send_confirm_email = true và auto_send_ticket_email = false thì gửi confirm email tự động.'
  })
  @ApiBody({
    type: UpdateEventSettingsDto,
    description: 'Cài đặt email tự động'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Event settings updated successfully',
    schema: {
      type: 'object',
      properties: {
        auto_send_confirm_email: {
          type: 'boolean',
          description: 'Tự động gửi email xác nhận khi thanh toán thành công'
        },
        auto_send_ticket_email: {
          type: 'boolean',
          description: 'Tự động gửi email vé điện tử khi thanh toán thành công'
        }
      },
      example: {
        auto_send_confirm_email: true,
        auto_send_ticket_email: false
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async updateEventSettings(
    @Param('eventId') eventId: string,
    @Body() settings: UpdateEventSettingsDto
  ): Promise<EventSettings> {
    return this.eventSettingsService.updateEventSettings(eventId, settings);
  }
} 