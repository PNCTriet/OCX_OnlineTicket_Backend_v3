import { Module } from '@nestjs/common';
import { DashboardService } from '../dashboard/dashboard.service';
import { DashboardController } from '../dashboard/dashboard.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {} 