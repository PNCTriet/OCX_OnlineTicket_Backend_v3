import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../ticket-status.enum';

export class CreateTicketDto {
  @ApiProperty({ example: 'event_cuid' })
  event_id: string;

  @ApiProperty({ example: 'Vé VIP' })
  name: string;

  @ApiProperty({ example: 'Ghế VIP gần sân khấu' })
  description?: string;

  @ApiProperty({ example: 1000000 })
  price: number;

  @ApiProperty({ example: 100 })
  total_qty: number;

  @ApiProperty({ example: '2025-08-01T08:00:00.000Z', required: false })
  sale_start?: string;

  @ApiProperty({ example: '2025-08-01T20:00:00.000Z', required: false })
  sale_end?: string;

  @ApiProperty({ enum: TicketStatus, example: TicketStatus.ACTIVE, required: false })
  status?: TicketStatus;
} 