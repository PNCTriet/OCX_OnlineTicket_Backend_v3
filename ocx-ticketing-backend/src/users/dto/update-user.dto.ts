import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'Nguyen', required: false })
  first_name?: string;

  @ApiProperty({ example: 'Van A', required: false })
  last_name?: string;

  @ApiProperty({ example: '0123456789', required: false })
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.png', required: false })
  avatar_url?: string;
} 