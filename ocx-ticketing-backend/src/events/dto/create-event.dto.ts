import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '../event-status.enum';

export class CreateEventDto {
  @ApiProperty({ example: 'org_cuid' })
  organization_id: string;

  @ApiProperty({ example: 'Sự kiện âm nhạc Howls' })
  title: string;

  @ApiProperty({ example: 'Đêm nhạc Howls Studio' })
  description?: string;

  @ApiProperty({ example: 'Nhà hát Hòa Bình' })
  location?: string;

  @ApiProperty({ example: '2025-08-01T19:00:00.000Z' })
  start_date: string;

  @ApiProperty({ example: '2025-08-01T22:00:00.000Z' })
  end_date: string;

  @ApiProperty({ example: 'https://howls.studio/banner.png' })
  banner_url?: string;

  @ApiProperty({ enum: EventStatus, example: EventStatus.DRAFT, required: false })
  status?: EventStatus;
} 