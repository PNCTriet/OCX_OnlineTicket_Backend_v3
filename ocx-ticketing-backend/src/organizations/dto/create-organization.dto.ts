import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Howls Studio' })
  name: string;

  @ApiProperty({ example: 'Tổ chức sự kiện âm nhạc' })
  description?: string;

  @ApiProperty({ example: 'contact@howls.studio' })
  contact_email?: string;

  @ApiProperty({ example: '0123456789' })
  phone?: string;

  @ApiProperty({ example: '123 Đường ABC, Quận 1, TP.HCM' })
  address?: string;

  @ApiProperty({ example: 'https://howls.studio/logo.png' })
  logo_url?: string;

  @ApiProperty({ example: 'https://howls.studio' })
  website?: string;
} 