import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import PDFDocument = require('pdfkit');
import { Response } from 'express';
import nodemailer from 'nodemailer';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Thêm các hàm thống kê ở đây

  async getSystemStats() {
    const [totalRevenue, totalTickets, totalOrders, totalEvents, totalOrganizations] = await Promise.all([
      this.prisma.order.aggregate({ _sum: { total_amount: true } }),
      this.prisma.ticket.aggregate({ _sum: { sold_qty: true } }),
      this.prisma.order.count(),
      this.prisma.event.count(),
      this.prisma.organization.count(),
    ]);
    return {
      total_revenue: totalRevenue._sum.total_amount || 0,
      total_tickets_sold: totalTickets._sum.sold_qty || 0,
      total_orders: totalOrders,
      total_events: totalEvents,
      total_organizations: totalOrganizations,
    };
  }

  async getOrganizationStats(organization_id: string) {
    const [totalRevenue, totalTickets, totalOrders, totalEvents] = await Promise.all([
      this.prisma.order.aggregate({ where: { organization_id }, _sum: { total_amount: true } }),
      this.prisma.ticket.aggregate({ where: { event: { organization_id } }, _sum: { sold_qty: true } }),
      this.prisma.order.count({ where: { organization_id } }),
      this.prisma.event.count({ where: { organization_id } }),
    ]);
    return {
      total_revenue: totalRevenue._sum.total_amount || 0,
      total_tickets_sold: totalTickets._sum.sold_qty || 0,
      total_orders: totalOrders,
      total_events: totalEvents,
    };
  }

  async getEventStats(event_id: string) {
    const [totalRevenue, totalTickets, totalOrders, totalCheckins] = await Promise.all([
      this.prisma.order.aggregate({ where: { event_id }, _sum: { total_amount: true } }),
      this.prisma.ticket.aggregate({ where: { event_id }, _sum: { sold_qty: true } }),
      this.prisma.order.count({ where: { event_id } }),
      this.prisma.checkinLog.count({ where: { order: { event_id } } }),
    ]);
    return {
      total_revenue: totalRevenue._sum.total_amount || 0,
      total_tickets_sold: totalTickets._sum.sold_qty || 0,
      total_orders: totalOrders,
      total_checkins: totalCheckins,
    };
  }

  async getOrganizationStatsByTime(organization_id: string, from: string, to: string, groupBy: 'day' | 'week' | 'month') {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    // Lấy orders trong khoảng thời gian
    const orders = await this.prisma.order.findMany({
      where: {
        organization_id,
        created_at: { gte: fromDate, lte: toDate },
      },
      select: {
        total_amount: true,
        created_at: true,
      },
    });
    // Lấy tickets sold trong khoảng thời gian
    const tickets = await this.prisma.ticket.findMany({
      where: {
        event: { organization_id },
        updated_at: { gte: fromDate, lte: toDate },
      },
      select: {
        sold_qty: true,
        updated_at: true,
      },
    });
    // Group by logic
    function getKey(date: Date) {
      if (groupBy === 'day') return date.toISOString().slice(0, 10);
      if (groupBy === 'month') return date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0');
      // week: ISO week string
      const d = new Date(date);
      d.setHours(0,0,0,0);
      d.setDate(d.getDate() - d.getDay() + 1); // Monday as first day
      return d.toISOString().slice(0, 10);
    }
    const revenueByTime: Record<string, number> = {};
    const ticketsByTime: Record<string, number> = {};
    orders.forEach(o => {
      const key = getKey(o.created_at);
      revenueByTime[key] = (revenueByTime[key] || 0) + Number(o.total_amount);
    });
    tickets.forEach(t => {
      const key = getKey(t.updated_at);
      ticketsByTime[key] = (ticketsByTime[key] || 0) + Number(t.sold_qty);
    });
    // Merge keys
    const allKeys = Array.from(new Set([...Object.keys(revenueByTime), ...Object.keys(ticketsByTime)])).sort();
    return allKeys.map(key => ({
      time: key,
      revenue: revenueByTime[key] || 0,
      tickets_sold: ticketsByTime[key] || 0,
    }));
  }

  async getSystemStatsByTime(from: string, to: string, groupBy: 'day' | 'week' | 'month') {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    // Lấy orders trong khoảng thời gian
    const orders = await this.prisma.order.findMany({
      where: {
        created_at: { gte: fromDate, lte: toDate },
      },
      select: {
        total_amount: true,
        created_at: true,
      },
    });
    
    // Lấy tickets sold trong khoảng thời gian
    const tickets = await this.prisma.ticket.findMany({
      where: {
        updated_at: { gte: fromDate, lte: toDate },
      },
      select: {
        sold_qty: true,
        updated_at: true,
      },
    });
    
    // Lấy events created trong khoảng thời gian
    const events = await this.prisma.event.findMany({
      where: {
        created_at: { gte: fromDate, lte: toDate },
      },
      select: {
        created_at: true,
      },
    });
    
    // Lấy organizations created trong khoảng thời gian
    const organizations = await this.prisma.organization.findMany({
      where: {
        created_at: { gte: fromDate, lte: toDate },
      },
      select: {
        created_at: true,
      },
    });
    
    // Group by logic
    function getKey(date: Date) {
      if (groupBy === 'day') return date.toISOString().slice(0, 10);
      if (groupBy === 'month') return date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0');
      // week: ISO week string
      const d = new Date(date);
      d.setHours(0,0,0,0);
      d.setDate(d.getDate() - d.getDay() + 1); // Monday as first day
      return d.toISOString().slice(0, 10);
    }
    
    const revenueByTime: Record<string, number> = {};
    const ticketsByTime: Record<string, number> = {};
    const eventsByTime: Record<string, number> = {};
    const organizationsByTime: Record<string, number> = {};
    
    orders.forEach(o => {
      const key = getKey(o.created_at);
      revenueByTime[key] = (revenueByTime[key] || 0) + Number(o.total_amount);
    });
    
    tickets.forEach(t => {
      const key = getKey(t.updated_at);
      ticketsByTime[key] = (ticketsByTime[key] || 0) + Number(t.sold_qty);
    });
    
    events.forEach(e => {
      const key = getKey(e.created_at);
      eventsByTime[key] = (eventsByTime[key] || 0) + 1;
    });
    
    organizations.forEach(o => {
      const key = getKey(o.created_at);
      organizationsByTime[key] = (organizationsByTime[key] || 0) + 1;
    });
    
    // Merge keys
    const allKeys = Array.from(new Set([
      ...Object.keys(revenueByTime), 
      ...Object.keys(ticketsByTime),
      ...Object.keys(eventsByTime),
      ...Object.keys(organizationsByTime)
    ])).sort();
    
    return allKeys.map(key => ({
      time: key,
      revenue: revenueByTime[key] || 0,
      tickets_sold: ticketsByTime[key] || 0,
      events_created: eventsByTime[key] || 0,
      organizations_created: organizationsByTime[key] || 0,
    }));
  }

  async getEventStatsByTime(event_id: string, from: string, to: string, groupBy: 'day' | 'week' | 'month') {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    // Lấy orders trong khoảng thời gian
    const orders = await this.prisma.order.findMany({
      where: {
        event_id,
        created_at: { gte: fromDate, lte: toDate },
      },
      select: {
        total_amount: true,
        created_at: true,
      },
    });
    // Lấy tickets sold trong khoảng thời gian
    const tickets = await this.prisma.ticket.findMany({
      where: {
        event_id,
        updated_at: { gte: fromDate, lte: toDate },
      },
      select: {
        sold_qty: true,
        updated_at: true,
      },
    });
    // Group by logic
    function getKey(date: Date) {
      if (groupBy === 'day') return date.toISOString().slice(0, 10);
      if (groupBy === 'month') return date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0');
      // week: ISO week string
      const d = new Date(date);
      d.setHours(0,0,0,0);
      d.setDate(d.getDate() - d.getDay() + 1); // Monday as first day
      return d.toISOString().slice(0, 10);
    }
    const revenueByTime: Record<string, number> = {};
    const ticketsByTime: Record<string, number> = {};
    orders.forEach(o => {
      const key = getKey(o.created_at);
      revenueByTime[key] = (revenueByTime[key] || 0) + Number(o.total_amount);
    });
    tickets.forEach(t => {
      const key = getKey(t.updated_at);
      ticketsByTime[key] = (ticketsByTime[key] || 0) + Number(t.sold_qty);
    });
    // Merge keys
    const allKeys = Array.from(new Set([...Object.keys(revenueByTime), ...Object.keys(ticketsByTime)])).sort();
    return allKeys.map(key => ({
      time: key,
      revenue: revenueByTime[key] || 0,
      tickets_sold: ticketsByTime[key] || 0,
    }));
  }

  async exportOrganizationStatsPdf(organization_id: string, from: string, to: string, groupBy: 'day' | 'week' | 'month', res: Response) {
    const stats = await this.getOrganizationStatsByTime(organization_id, from, to, groupBy);
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="organization-stats.pdf"');
    doc.pipe(res);
    doc.fontSize(18).text('Báo cáo thống kê tổ chức', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Tổ chức: ${organization_id}`);
    doc.text(`Từ: ${from}  Đến: ${to}`);
    doc.text(`Nhóm theo: ${groupBy}`);
    doc.moveDown();
    doc.fontSize(14).text('Thống kê:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text('Thời gian | Doanh thu | Vé bán');
    doc.moveDown(0.2);
    stats.forEach(row => {
      doc.text(`${row.time} | ${row.revenue} | ${row.tickets_sold}`);
    });
    doc.end();
  }

  async exportOrganizationStatsCsv(organization_id: string, from: string, to: string, groupBy: 'day' | 'week' | 'month', res: Response) {
    const stats = await this.getOrganizationStatsByTime(organization_id, from, to, groupBy);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="organization-stats.csv"');
    res.write('Thời gian,Doanh thu,Vé bán\n');
    stats.forEach(row => {
      res.write(`${row.time},${row.revenue},${row.tickets_sold}\n`);
    });
    res.end();
  }

  async sendOrganizationReportEmail(organization_id: string, from: string, to: string, groupBy: 'day' | 'week' | 'month', email: string, format: 'csv' | 'pdf' = 'csv') {
    // Tạo buffer file CSV
    const stats = await this.getOrganizationStatsByTime(organization_id, from, to, groupBy);
    let buffer: Buffer;
    let filename = 'organization-stats.' + format;
    let contentType = 'text/csv';
    if (format === 'csv') {
      let csv = 'Thời gian,Doanh thu,Vé bán\n';
      stats.forEach(row => {
        csv += `${row.time},${row.revenue},${row.tickets_sold}\n`;
      });
      buffer = Buffer.from(csv, 'utf-8');
    } else {
      // PDF: dùng PDFKit tạo buffer
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.fontSize(18).text('Báo cáo thống kê tổ chức', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Tổ chức: ${organization_id}`);
      doc.text(`Từ: ${from}  Đến: ${to}`);
      doc.text(`Nhóm theo: ${groupBy}`);
      doc.moveDown();
      doc.fontSize(14).text('Thống kê:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text('Thời gian | Doanh thu | Vé bán');
      doc.moveDown(0.2);
      stats.forEach(row => {
        doc.text(`${row.time} | ${row.revenue} | ${row.tickets_sold}`);
      });
      doc.end();
      await new Promise(resolve => doc.on('end', resolve));
      buffer = Buffer.concat(chunks);
      filename = 'organization-stats.pdf';
      contentType = 'application/pdf';
    }
    // Gửi email
    const transporter = nodemailer.createTransport({
      // Cấu hình SMTP ở đây (ví dụ dùng Gmail, SendGrid, ...)
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@example.com',
      to: email,
      subject: 'Báo cáo thống kê tổ chức',
      text: 'Đính kèm báo cáo thống kê tổ chức.',
      attachments: [
        {
          filename,
          content: buffer,
          contentType,
        },
      ],
    });
    return { message: 'Email sent successfully' };
  }
} 