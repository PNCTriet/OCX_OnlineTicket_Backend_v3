export class EmailHeaderComponent {
  static generate(data: { customerName: string; eventTitle?: string }): string {
    return `
    <div style="text-align: center; margin-bottom: 32px;">
        <img src="https://www.otcayxe.com/images/hero_logo_ss3_alt1.png" alt="Ớt Cay Xè Logo" style="max-width: 300px; display: block; margin: 0 auto;" />
        <h2 style="color: white !important; font-size: 40px; font-weight: 900 !important; text-transform: uppercase !important;">${data.eventTitle || 'Vé tham dự sự kiện'}</h2>
        <p style="margin-top: 16px; font-size: 16px; line-height: 1.6; text-align: left; opacity: 0.9; color: white !important;">
            Gửi ${data.customerName},<br />
            Cảm ơn bạn đã đồng hành cùng hành trình trồng trọt của nhà vườn <strong style="color: white !important;">Ớt Cay Xè</strong>.
            Đây là xác nhận đặt vé của bạn – mọi thông tin quan trọng đã được tổng hợp bên dưới.
            Hẹn gặp lại bạn tại sự kiện!
        </p>
    </div>
    `;
  }
} 