import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard, Roles } from '../auth/role.guard';
import { UserRole } from '../auth/roles.enum';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @Post('send-tickets/:orderId')
  @ApiOperation({ 
    summary: 'Gửi email vé điện tử với PDF đính kèm',
    description: 'Gửi email chứa vé điện tử PDF cho đơn hàng đã thanh toán thành công'
  })
  @ApiResponse({ status: 200, description: 'Email vé điện tử đã được gửi thành công' })
  @ApiResponse({ status: 400, description: 'Đơn hàng chưa thanh toán hoặc không tìm thấy' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async sendTicketEmail(@Param('orderId') orderId: string) {
    return this.emailService.sendTicketEmail(orderId);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @Post('send-confirmation/:orderId')
  @ApiOperation({ 
    summary: 'Gửi email xác nhận đặt vé thành công',
    description: 'Gửi email xác nhận đặt vé (không kèm PDF) để thông báo cho user biết đơn hàng đã được ghi nhận'
  })
  @ApiResponse({ status: 200, description: 'Email xác nhận đã được gửi thành công' })
  @ApiResponse({ status: 400, description: 'Không tìm thấy đơn hàng hoặc email user' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async sendOrderConfirmationEmail(@Param('orderId') orderId: string) {
    return this.emailService.sendOrderConfirmationEmail(orderId);
  }
} 