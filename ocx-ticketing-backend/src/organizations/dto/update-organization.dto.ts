import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganizationDto {
  @ApiProperty({ example: 'Howls Studio', required: false })
  name?: string;

  @ApiProperty({ example: 'Tổ chức sự kiện âm nhạc', required: false })
  description?: string;

  @ApiProperty({ example: 'contact@howls.studio', required: false })
  contact_email?: string;

  @ApiProperty({ example: '0123456789', required: false })
  phone?: string;

  @ApiProperty({ example: '123 Đường ABC, Quận 1, TP.HCM', required: false })
  address?: string;

  @ApiProperty({ example: 'https://howls.studio/logo.png', required: false })
  logo_url?: string;

  @ApiProperty({ example: 'https://howls.studio', required: false })
  website?: string;
} 