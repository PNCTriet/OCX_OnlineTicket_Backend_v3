import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '../event-status.enum';

export class UpdateEventDto {
  @ApiProperty({ example: 'Sự kiện mới', required: false })
  title?: string;

  @ApiProperty({ example: 'Mô tả mới', required: false })
  description?: string;

  @ApiProperty({ example: 'Nhà hát Hòa Bình', required: false })
  location?: string;

  @ApiProperty({ example: '2025-08-01T19:00:00.000Z', required: false })
  start_date?: string;

  @ApiProperty({ example: '2025-08-01T22:00:00.000Z', required: false })
  end_date?: string;

  @ApiProperty({ example: 'https://howls.studio/banner.png', required: false })
  banner_url?: string;

  @ApiProperty({ enum: EventStatus, example: EventStatus.DRAFT, required: false })
  status?: EventStatus;
} 