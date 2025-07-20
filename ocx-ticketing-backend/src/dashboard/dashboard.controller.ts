import { Controller, Get, Param, Query, Res, Body, Post, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBody, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

class SendReportDto {
  email: string;
  from: string;
  to: string;
  groupBy?: 'day' | 'week' | 'month';
  format?: 'csv' | 'pdf';
}

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Thêm các route thống kê ở đây
  @Get('system')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getSystemStats() {
    return this.dashboardService.getSystemStats();
  }

  @Get('system/time')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getSystemStatsByTime(@Query('from') from: string, @Query('to') to: string, @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day') {
    return this.dashboardService.getSystemStatsByTime(from, to, groupBy);
  }

  @Get('organization/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getOrganizationStats(@Param('id') id: string) {
    return this.dashboardService.getOrganizationStats(id);
  }

  @Get('organization/:id/time')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getOrganizationStatsByTime(@Param('id') id: string, @Query('from') from: string, @Query('to') to: string, @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day') {
    return this.dashboardService.getOrganizationStatsByTime(id, from, to, groupBy);
  }

  @Get('organization/:id/export/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  exportOrganizationStatsPdf(@Param('id') id: string, @Query('from') from: string, @Query('to') to: string, @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day', @Res() res) {
    return this.dashboardService.exportOrganizationStatsPdf(id, from, to, groupBy, res);
  }

  @Get('organization/:id/export/csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  exportOrganizationStatsCsv(@Param('id') id: string, @Query('from') from: string, @Query('to') to: string, @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day', @Res() res) {
    return this.dashboardService.exportOrganizationStatsCsv(id, from, to, groupBy, res);
  }

  @Post('organization/:id/send-report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    description: 'Thông tin gửi báo cáo qua email',
    type: SendReportDto,
    examples: {
      example1: {
        summary: 'Gửi báo cáo CSV theo ngày',
        value: {
          email: 'recipient@example.com',
          from: '2025-08-01',
          to: '2025-08-31',
          groupBy: 'day',
          format: 'csv'
        }
      },
      example2: {
        summary: 'Gửi báo cáo PDF theo tuần',
        value: {
          email: 'recipient@example.com',
          from: '2025-08-01',
          to: '2025-08-31',
          groupBy: 'week',
          format: 'pdf'
        }
      }
    }
  })
  async sendOrganizationReportEmail(@Param('id') id: string, @Body() body: SendReportDto) {
    const { email, from, to, groupBy = 'day', format = 'csv' } = body;
    return this.dashboardService.sendOrganizationReportEmail(id, from, to, groupBy, email, format);
  }

  @Get('event/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getEventStats(@Param('id') id: string) {
    return this.dashboardService.getEventStats(id);
  }

  @Get('event/:id/time')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getEventStatsByTime(@Param('id') id: string, @Query('from') from: string, @Query('to') to: string, @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day') {
    return this.dashboardService.getEventStatsByTime(id, from, to, groupBy);
  }
} 