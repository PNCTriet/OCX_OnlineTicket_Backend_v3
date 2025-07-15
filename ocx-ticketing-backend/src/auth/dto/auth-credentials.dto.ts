import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialsDto {
  @ApiProperty({ example: 'user@gmail.com' })
  email: string;

  @ApiProperty({ example: '123456' })
  password: string;
} 