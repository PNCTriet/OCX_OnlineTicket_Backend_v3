import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'supabase-uuid' })
  supabase_id: string;

  @ApiProperty({ example: 'user@gmail.com' })
  email: string;

  @ApiProperty({ example: 'Nguyen' })
  first_name?: string;

  @ApiProperty({ example: 'Van A' })
  last_name?: string;

  @ApiProperty({ example: '0123456789' })
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.png' })
  avatar_url?: string;
} 