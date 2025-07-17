import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Request } from 'express';
import { ApiBody, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
  user: any;
  userLocal: any;
}

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        organization_id: { type: 'string', example: 'org_cuid' },
        event_id: { type: 'string', example: 'event_cuid' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ticket_id: { type: 'string', example: 'ticket_cuid' },
              quantity: { type: 'number', example: 2 },
            },
            required: ['ticket_id', 'quantity'],
          },
          example: [
            { ticket_id: 'ticket_cuid', quantity: 2 },
            { ticket_id: 'ticket_cuid_2', quantity: 1 },
          ],
        },
      },
      required: ['organization_id', 'items'],
      example: {
        organization_id: 'org_cuid',
        event_id: 'event_cuid',
        items: [
          { ticket_id: 'ticket_cuid', quantity: 2 },
          { ticket_id: 'ticket_cuid_2', quantity: 1 },
        ],
      },
    },
    description: 'Tạo order mới. Lưu ý: organization_id, event_id, ticket_id phải là ID thực tế.',
  })
  async createOrder(@Body() body: {
    organization_id: string;
    event_id?: string;
    items: Array<{
      ticket_id: string;
      quantity: number;
    }>;
  }, @CurrentUser() userLocal: any) {
    return this.ordersService.createOrder({
      user_id: userLocal.id, // Lấy user_id từ user local
      organization_id: body.organization_id,
      event_id: body.event_id,
      items: body.items,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/cancel')
  async cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async getAllOrders(@CurrentUser() userLocal: any) {
    return this.ordersService.getAllOrders(userLocal.id, userLocal.role); // Truyền cả user_id và role
  }

  // CRUD cho Order Items
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':orderId/items')
  async getOrderItems(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderItems(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':orderId/items')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ticket_id: { type: 'string', example: 'ticket_cuid' },
        quantity: { type: 'number', example: 2 },
      },
      required: ['ticket_id', 'quantity'],
      example: {
        ticket_id: 'ticket_cuid',
        quantity: 2,
      },
    },
    description: 'Thêm order item vào order.',
  })
  async createOrderItem(
    @Param('orderId') orderId: string,
    @Body() data: {
      ticket_id: string;
      quantity: number;
    },
  ) {
    return this.ordersService.createOrderItem(orderId, data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':orderId/items/:itemId')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: { type: 'number', example: 3 },
      },
      example: {
        quantity: 3,
      },
    },
    description: 'Cập nhật order item.',
  })
  async updateOrderItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() data: {
      quantity?: number;
    },
  ) {
    return this.ordersService.updateOrderItem(orderId, itemId, data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':orderId/items/:itemId')
  async deleteOrderItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.ordersService.deleteOrderItem(orderId, itemId);
  }

  // CRUD cho Payments
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':orderId/payments')
  async getOrderPayments(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderPayments(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':orderId/payments')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 1000000 },
        payment_method: { type: 'string', example: 'STRIPE' },
        transaction_id: { type: 'string', example: 'txn_123456' },
        status: { type: 'string', example: 'SUCCESS' },
      },
      required: ['amount', 'payment_method', 'status'],
      example: {
        amount: 1000000,
        payment_method: 'STRIPE',
        transaction_id: 'txn_123456',
        status: 'SUCCESS',
      },
    },
    description: 'Thêm payment cho order.',
  })
  async createPayment(
    @Param('orderId') orderId: string,
    @Body() data: {
      amount: number;
      payment_method: string;
      transaction_id?: string;
      status: string;
    },
  ) {
    return this.ordersService.createPayment(orderId, data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':orderId/payments/:paymentId')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 1000000 },
        payment_method: { type: 'string', example: 'STRIPE' },
        transaction_id: { type: 'string', example: 'txn_123456' },
        status: { type: 'string', example: 'SUCCESS' },
      },
      example: {
        amount: 1000000,
        payment_method: 'STRIPE',
        transaction_id: 'txn_123456',
        status: 'SUCCESS',
      },
    },
    description: 'Cập nhật payment.',
  })
  async updatePayment(
    @Param('orderId') orderId: string,
    @Param('paymentId') paymentId: string,
    @Body() data: {
      amount?: number;
      payment_method?: string;
      transaction_id?: string;
      status?: string;
    },
  ) {
    return this.ordersService.updatePayment(orderId, paymentId, data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':orderId/payments/:paymentId')
  async deletePayment(
    @Param('orderId') orderId: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.ordersService.deletePayment(orderId, paymentId);
  }
}
