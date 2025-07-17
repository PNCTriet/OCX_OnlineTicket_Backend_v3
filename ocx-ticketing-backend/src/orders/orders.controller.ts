import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
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
    return this.ordersService.getAllOrders(userLocal.id); // Lấy user_id từ user local
  }
}
