import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class QRService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // Generate unique QR code data
  private generateQRData(orderId: string, orderItemId: string, ticketId: string, quantity: number): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    
    // Tạo data unique cho QR code
    const qrData = {
      orderId,
      orderItemId,
      ticketId,
      quantity,
      timestamp,
      hash: `${orderId}_${orderItemId}_${timestamp}_${randomString}`,
    };

    return JSON.stringify(qrData);
  }

  // Generate QR code image và upload lên Supabase Storage
  async generateAndUploadQR(
    orderId: string,
    orderItemId: string,
    ticketId: string,
    quantity: number,
    ticketName: string
  ): Promise<string> {
    try {
      // Generate QR data
      const qrData = this.generateQRData(orderId, orderItemId, ticketId, quantity);
      
      // Generate QR code image
      const qrImageBuffer = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: 'H',
        type: 'png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Upload lên Supabase Storage
      const fileName = `qr-codes/${orderId}/${orderItemId}_${ticketName.replace(/\s+/g, '_')}.png`;
      
      const { data, error } = await this.supabase.storage
        .from('ticket-qr-codes')
        .upload(fileName, qrImageBuffer, {
          contentType: 'image/png',
          cacheControl: '3600',
        });

      if (error) {
        console.error('Error uploading QR code to Supabase:', error);
        throw new Error(`Failed to upload QR code: ${error.message}`);
      }

      // Trả về public URL
      const { data: urlData } = this.supabase.storage
        .from('ticket-qr-codes')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  // Verify QR code data
  verifyQRData(qrDataString: string): {
    isValid: boolean;
    data?: any;
    error?: string;
  } {
    try {
      const qrData = JSON.parse(qrDataString);
      
      // Kiểm tra các field bắt buộc
      const requiredFields = ['orderId', 'orderItemId', 'ticketId', 'quantity', 'timestamp', 'hash'];
      for (const field of requiredFields) {
        if (!qrData[field]) {
          return {
            isValid: false,
            error: `Missing required field: ${field}`,
          };
        }
      }

      // Kiểm tra timestamp (QR code không quá cũ - 24 giờ)
      const qrTimestamp = qrData.timestamp;
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 giờ

      if (now - qrTimestamp > maxAge) {
        return {
          isValid: false,
          error: 'QR code has expired',
        };
      }

      return {
        isValid: true,
        data: qrData,
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid QR code format',
      };
    }
  }

  // Generate QR code cho nhiều order items
  async generateQRForOrderItems(orderItems: Array<{
    orderId: string;
    orderItemId: string;
    ticketId: string;
    quantity: number;
    ticketName: string;
  }>): Promise<Array<{
    orderItemId: string;
    qrUrl: string;
  }>> {
    const qrResults: Array<{
      orderItemId: string;
      qrUrl: string;
    }> = [];

    for (const item of orderItems) {
      try {
        const qrUrl = await this.generateAndUploadQR(
          item.orderId,
          item.orderItemId,
          item.ticketId,
          item.quantity,
          item.ticketName
        );

        qrResults.push({
          orderItemId: item.orderItemId,
          qrUrl,
        });
      } catch (error) {
        console.error(`Failed to generate QR for order item ${item.orderItemId}:`, error);
        // Vẫn tiếp tục với các item khác
      }
    }

    return qrResults;
  }
} 