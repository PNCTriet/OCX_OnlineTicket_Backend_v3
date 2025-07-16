import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { UsersService } from '../users/users.service';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
    // Tự động tạo user mapping nếu chưa có
    if (data.user) {
      const uuid = data.user.id;
      let user = await this.usersService.findBySupabaseId(uuid);
      if (!user) {
        user = await this.usersService.create({
          supabase_id: uuid,
          email: typeof data.user.email === 'string' ? data.user.email : '',
          first_name: typeof data.user.user_metadata?.first_name === 'string' ? data.user.user_metadata.first_name : '',
          last_name: typeof data.user.user_metadata?.last_name === 'string' ? data.user.user_metadata.last_name : '',
          phone: typeof data.user.phone === 'string' ? data.user.phone : '',
          avatar_url: typeof data.user.user_metadata?.avatar_url === 'string' ? data.user.user_metadata.avatar_url : '',
        });
      }
    }
    return {
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user: data.user,
    };
  }

  async register(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return { error: error.message };
    }
    return {
      user: data.user,
      message: 'Please check your email to confirm registration.'
    };
  }

  async logout(user: any) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return {
      message: 'Logged out successfully'
    };
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) {
      return { error: error.message };
    }
    return {
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user: data.user,
    };
  }
}
