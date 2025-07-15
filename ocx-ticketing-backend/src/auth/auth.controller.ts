import { Controller, Get, Req, UseGuards, Post, Body } from '@nestjs/common';
import { SupabaseJwtGuard } from './supabase-jwt.guard';
import { Request } from 'express';
import { AuthService } from './auth.service';

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
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }
}
