import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateEventSettingsDto {
  @ApiProperty({
    description: 'Tự động gửi email xác nhận khi thanh toán thành công',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  auto_send_confirm_email?: boolean;

  @ApiProperty({
    description: 'Tự động gửi email vé điện tử khi thanh toán thành công (ưu tiên cao hơn confirm email)',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  auto_send_ticket_email?: boolean;
} 