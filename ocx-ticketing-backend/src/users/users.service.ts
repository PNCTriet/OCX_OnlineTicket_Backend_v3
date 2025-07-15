import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../auth/roles.enum';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const user = await this.prisma.user.create({ data });
    // Đồng bộ role lên Supabase Auth (user_metadata.role)
    try {
      // Lấy role từ user_organizations nếu có, mặc định USER
      const userOrg = await this.prisma.userOrganization.findFirst({
        where: { user_id: user.id },
      });
      const role = userOrg?.role || UserRole.USER;
      await supabaseAdmin.auth.admin.updateUserById(user.supabase_id, {
        user_metadata: { role },
      });
    } catch (err) {
      console.error('Failed to sync role to Supabase Auth:', err.message);
    }
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
} 