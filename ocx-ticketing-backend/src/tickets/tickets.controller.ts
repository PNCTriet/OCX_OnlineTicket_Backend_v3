import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all tickets or filter by organization',
    description: 'Retrieve all tickets. If organization_id is provided, returns only tickets from events of that organization with detailed information including event and organization.'
  })
  @ApiQuery({ 
    name: 'organization_id', 
    required: false, 
    description: 'Filter tickets by organization ID (through events). If provided, returns tickets with event and organization details.',
    example: 'org_cuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of tickets retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'ticket_cuid' },
          name: { type: 'string', example: 'Vé VIP' },
          description: { type: 'string', example: 'Ghế VIP gần sân khấu' },
          price: { type: 'number', example: 1000000 },
          total_qty: { type: 'number', example: 100 },
          sold_qty: { type: 'number', example: 50 },
          status: { type: 'string', example: 'ACTIVE' },
          event: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'event_cuid' },
              title: { type: 'string', example: 'Sự kiện âm nhạc Howls' },
              start_date: { type: 'string', format: 'date-time', example: '2025-08-01T19:00:00.000Z' },
              end_date: { type: 'string', format: 'date-time', example: '2025-08-01T22:00:00.000Z' },
              location: { type: 'string', example: 'Nhà hát Hòa Bình' },
              status: { type: 'string', example: 'PUBLISHED' },
              organization: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'org_cuid' },
                  name: { type: 'string', example: 'Howls Studio' },
                  logo_url: { type: 'string', example: 'https://howls.studio/logo.png' }
                }
              }
            }
          }
        }
      }
    }
  })
  findAll(@Query('organization_id') organization_id?: string) {
    if (organization_id) {
      return this.ticketsService.findByOrganization(organization_id);
    }
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }

  @Get('/event/:event_id')
  @ApiOperation({ summary: 'Get tickets by event ID' })
  @ApiResponse({ status: 200, description: 'Tickets for event retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findByEvent(@Param('event_id') event_id: string) {
    return this.ticketsService.findByEvent(event_id);
  }
} 