import { Controller, Get, Req, UseGuards, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { ApiBody, ApiBearerAuth } from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
  user: any;
  userLocal: any;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  getMe(@CurrentUser() userLocal: any) {
    return {
      user: userLocal, // Trả về user local thay vì JWT payload
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('sync-profile')
  async syncProfile(@CurrentUser() userLocal: any, @Req() req: AuthenticatedRequest) {
    // Sync user data from Supabase to local database
    const supabaseUser = req.user;
    
    const updatedUser = await this.authService.syncUserProfile(
      userLocal.id,
      {
        email: supabaseUser.email,
        first_name: supabaseUser.user_metadata?.full_name?.split(' ')[0] || null,
        last_name: supabaseUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || null,
        avatar_url: supabaseUser.user_metadata?.avatar_url || null,
        is_verified: supabaseUser.email_confirmed_at ? true : false,
      }
    );

    return {
      message: 'Profile synced successfully',
      user: updatedUser
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
    },
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
    },
  })
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('logout')
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: { type: 'string', example: 'your_refresh_token' },
      },
      required: ['refresh_token'],
    },
  })
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }
}
