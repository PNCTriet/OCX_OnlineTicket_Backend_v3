import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all events or filter by organization',
    description: 'Retrieve all events. If organization_id is provided, returns only events from that organization with detailed information including organization and tickets.'
  })
  @ApiQuery({ 
    name: 'organization_id', 
    required: false, 
    description: 'Filter events by organization ID. If provided, returns events with organization and tickets details.',
    example: 'org_cuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of events retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'event_cuid' },
          title: { type: 'string', example: 'Sự kiện âm nhạc Howls' },
          description: { type: 'string', example: 'Đêm nhạc Howls Studio' },
          location: { type: 'string', example: 'Nhà hát Hòa Bình' },
          start_date: { type: 'string', format: 'date-time', example: '2025-08-01T19:00:00.000Z' },
          end_date: { type: 'string', format: 'date-time', example: '2025-08-01T22:00:00.000Z' },
          status: { type: 'string', example: 'PUBLISHED' },
          organization: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'org_cuid' },
              name: { type: 'string', example: 'Howls Studio' },
              logo_url: { type: 'string', example: 'https://howls.studio/logo.png' }
            }
          },
          tickets: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'ticket_cuid' },
                name: { type: 'string', example: 'Vé VIP' },
                price: { type: 'number', example: 1000000 },
                total_qty: { type: 'number', example: 100 },
                sold_qty: { type: 'number', example: 50 },
                status: { type: 'string', example: 'ACTIVE' }
              }
            }
          }
        }
      }
    }
  })
  findAll(@Query('organization_id') organization_id?: string) {
    if (organization_id) {
      return this.eventsService.findByOrganization(organization_id);
    }
    return this.eventsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event by ID' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event by ID' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
} 