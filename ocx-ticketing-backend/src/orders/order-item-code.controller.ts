import { Controller, Get, Param, Patch, Delete, Query, Body, UseGuards } from '@nestjs/common';
import { OrderItemCodeService } from './order-item-code.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard, Roles } from '../auth/role.guard';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('order-item-codes')
@Controller('order-item-codes')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.SUPERADMIN)
@ApiBearerAuth()
export class OrderItemCodeController {
  constructor(private readonly orderItemCodeService: OrderItemCodeService) {}

  @Get()
  @ApiOperation({ summary: 'List all order item codes (optionally by order_item_id)' })
  @ApiQuery({ name: 'orderItemId', required: false, description: 'Filter by order_item_id' })
  @ApiResponse({ status: 200, description: 'List of order item codes' })
  async findAll(@Query('orderItemId') orderItemId?: string) {
    return this.orderItemCodeService.findAll(orderItemId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detail of an order item code' })
  @ApiResponse({ status: 200, description: 'Order item code detail' })
  async findOne(@Param('id') id: string) {
    return this.orderItemCodeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order item code (used, used_at, ...)' })
  @ApiResponse({ status: 200, description: 'Order item code updated' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.orderItemCodeService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order item code' })
  @ApiResponse({ status: 200, description: 'Order item code deleted' })
  async remove(@Param('id') id: string) {
    return this.orderItemCodeService.remove(id);
  }
} 