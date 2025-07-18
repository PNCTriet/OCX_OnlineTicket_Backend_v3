import { Controller, Post, Body, Get, Param, UseGuards, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard, Roles } from '../auth/role.guard';
import { UserRole } from '@prisma/client';

interface SepayWebhookDto {
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: string | null;
  code: string;
  content: string;
  transferType: string;
  description: string;
  transferAmount: number;
  referenceCode: string;
  accumulated: number;
  id: number;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook/sepay')
  @ApiOperation({ 
    summary: 'Sepay webhook endpoint',
    description: 'Receive payment notifications from Sepay gateway. System will automatically match payment with pending orders based on amount, time, and content patterns.'
  })
  @ApiBody({ type: 'object', description: 'Sepay webhook payload' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  async handleSepayWebhook(@Body() webhookData: SepayWebhookDto) {
    return this.paymentsService.handleSepayWebhook(webhookData);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment information for an order' })
  @ApiResponse({ status: 200, description: 'Payment information retrieved' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Access denied. Admin/Organizer role required.' })
  async getPaymentByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentByOrder(orderId);
  }

  @Get('match/:orderId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Manually match payment with order',
    description: 'Match an unmatched payment with a specific order. Useful when automatic matching fails.'
  })
  @ApiResponse({ status: 200, description: 'Payment matched successfully' })
  @ApiResponse({ status: 404, description: 'Order or payment not found' })
  @ApiResponse({ status: 403, description: 'Access denied. Admin/Organizer role required.' })
  async matchPaymentWithOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.matchPaymentWithOrder(orderId);
  }

  @Get('unmatched')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get list of unmatched payments',
    description: 'View all payments that have not been matched with any order yet'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of records to skip (default: 0)' })
  @ApiResponse({ status: 200, description: 'List of unmatched payments' })
  @ApiResponse({ status: 403, description: 'Access denied. Admin/Organizer role required.' })
  async getUnmatchedPayments(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.paymentsService.getUnmatchedPayments(
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0
    );
  }

  @Get('pending-orders')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN_ORGANIZER, UserRole.OWNER_ORGANIZER, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get list of pending orders',
    description: 'View all orders with PENDING status that can be matched with payments'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of records to skip (default: 0)' })
  @ApiResponse({ status: 200, description: 'List of pending orders' })
  @ApiResponse({ status: 403, description: 'Access denied. Admin/Organizer role required.' })
  async getPendingOrders(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.paymentsService.getPendingOrders(
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0
    );
  }
} 