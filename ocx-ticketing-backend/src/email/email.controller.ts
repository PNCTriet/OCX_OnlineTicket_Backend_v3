import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard, Roles } from '../auth/role.guard';
import { UserRole } from '@prisma/client';

class SendTicketEmailDto {
  @ApiProperty({ 
    description: 'Order ID to send tickets for',
    example: 'order_cuid_here',
    type: String
  })
  orderId: string;
}

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-ticket')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Send ticket email to user',
    description: 'Send ticket email with PDF attachments to user based on order ID. Order must be in PAID status.'
  })
  @ApiBody({ 
    type: SendTicketEmailDto,
    description: 'Order ID to send tickets for'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Email sent successfully' },
        ticketsSent: { type: 'number', example: 3 },
        orderNumber: { type: 'string', example: 'order_cuid' },
        sentAt: { type: 'string', example: '2024-01-15T14:30:25.000Z' },
        emailId: { type: 'string', example: 'resend_email_id' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Order not found or not paid' })
  @ApiResponse({ status: 403, description: 'Access denied. Admin/Organizer role required.' })
  @ApiResponse({ status: 500, description: 'Failed to send email' })
  async sendTicketEmail(@Body() body: SendTicketEmailDto) {
    return this.emailService.sendTicketEmail(body.orderId);
  }
} 