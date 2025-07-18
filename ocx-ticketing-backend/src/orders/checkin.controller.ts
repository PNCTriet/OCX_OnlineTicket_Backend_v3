import { Controller, Post, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { CheckinService } from './checkin.service';

@ApiTags('checkin')
@Controller('checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('verify-qr')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        qrData: { 
          type: 'string', 
          example: '{"orderId":"cmd6ctsyr0001jkhlwwr0dsis","orderItemId":"item_123","ticketId":"ticket_456","quantity":2,"timestamp":1640995200000,"hash":"abc123"}' 
        },
        checkedBy: { 
          type: 'string', 
          example: 'admin@example.com' 
        },
      },
      required: ['qrData', 'checkedBy'],
    },
    description: 'Verify QR code and perform check-in',
  })
  async checkInWithQR(
    @Body() body: {
      qrData: string;
      checkedBy: string;
    }
  ) {
    return this.checkinService.checkInWithQR(body.qrData, body.checkedBy);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('logs')
  async getCheckinLogs(
    @Query('eventId') eventId?: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.checkinService.getCheckinLogs(eventId, orderId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('stats/:eventId')
  async getCheckinStats(@Param('eventId') eventId: string) {
    return this.checkinService.getCheckinStats(eventId);
  }
} 