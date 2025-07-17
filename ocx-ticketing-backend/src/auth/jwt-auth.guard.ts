import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma.service';
import { UserRole } from './roles.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, authenticate the JWT token
    const result = await super.canActivate(context);
    if (!result) {
      return false;
    }

    // Get the request and user from the context
    const request = context.switchToHttp().getRequest();
    const user = request.user; // This is set by the JWT strategy

    if (!user) {
      throw new UnauthorizedException('Invalid or missing JWT token');
    }

    try {
      // Lấy supabase_id từ JWT payload
      const supabaseId = user.sub;
      
      // Tìm user local theo supabase_id
      let userLocal = await this.prisma.user.findUnique({
        where: { supabase_id: supabaseId }
      });

      // Nếu user chưa tồn tại trong local DB, tạo mới
      if (!userLocal) {
        userLocal = await this.prisma.user.create({
          data: {
            supabase_id: supabaseId,
            email: user.email,
            first_name: user.user_metadata?.full_name?.split(' ')[0] || null,
            last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            is_verified: user.email_confirmed_at ? true : false,
            // role sẽ được set default trong schema Prisma
          }
        });
      }

      // Attach cả JWT user và local user vào request
      request.user = user; // JWT payload
      request.userLocal = userLocal; // User từ database local

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error processing user authentication');
    }
  }
} 