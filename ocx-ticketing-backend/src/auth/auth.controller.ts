import { Controller, Get, Req, UseGuards, Post, Body } from '@nestjs/common';
import { SupabaseJwtGuard } from './supabase-jwt.guard';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(SupabaseJwtGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return {
      supabaseUser: req['supabaseUser'],
    };
  }

  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'yourpassword' },
      },
      required: ['email', 'password'],
      example: {
        email: 'user@example.com',
        password: 'yourpassword',
      },
    },
    description: 'Đăng nhập với email và password Supabase',
  })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'yourpassword' },
      },
      required: ['email', 'password'],
      example: {
        email: 'user@example.com',
        password: 'yourpassword',
      },
    },
    description: 'Đăng ký tài khoản mới với email và password Supabase',
  })
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @UseGuards(SupabaseJwtGuard)
  @Post('logout')
  @ApiBody({
    schema: {
      type: 'object',
      example: {},
    },
    description: 'Logout không cần body, chỉ cần access token. Có thể gửi object rỗng {}.',
  })
  async logout(@Req() req: Request) {
    return this.authService.logout(req['supabaseUser']);
  }

  @Post('refresh')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: { type: 'string', example: 'your_refresh_token' },
      },
      required: ['refresh_token'],
      example: {
        refresh_token: 'your_refresh_token',
      },
    },
    description: 'Lấy access token mới từ refresh token',
  })
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }
}
