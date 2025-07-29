export class TicketEmailComponent {
  static generate(data: any): string {
    return `
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8" />
    <title>Xác nhận đặt vé - Ớt Cay Xè</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        @media (max-width: 600px) {
            .info-row {
                flex-direction: column !important;
                align-items: flex-start !important;
            }

            .info-row span {
                margin-top: 4px !important;
            }
        }
    </style>
</head>

<body style="margin:0; padding:0; font-family:Segoe UI, sans-serif;">
    <div style="
        background: linear-gradient(to bottom, rgba(255, 106, 0, 0.425), rgba(0,0,0,0.2)),
                    url('https://www.otcayxe.com/images/hero_background_ss4_mobile.jpg') top center / cover no-repeat;
        background-color: black;
        padding: 0;
      ">
        <div style="
          max-width: 600px;
          margin: 0 auto;
          padding: 48px 24px 24px 24px;
          border-radius: 16px;
          color: white !important;
        ">
            <div style="text-align: center; margin-bottom: 32px;">
                <img src="https://www.otcayxe.com/images/hero_logo_ss3_alt1.png" alt="Ớt Cay Xè Logo" style="max-width: 300px; display: block; margin: 0 auto;" />
                <h2 style="color: white !important; font-size: 40px; font-weight: 900 !important; text-transform: uppercase !important;">Vé tham dự sự kiện</h2>
                <p style="margin-top: 16px; font-size: 16px; line-height: 1.6; text-align: left; opacity: 0.9; color: white !important;">
                    Gửi ${data.customerInfo.fullName},<br />
                    Cảm ơn bạn đã đồng hành cùng hành trình trồng trọt của nhà vườn <strong style="color: white !important;">Ớt Cay Xè</strong>.
                    Đây là xác nhận đặt vé của bạn – mọi thông tin quan trọng đã được tổng hợp bên dưới.
                    Hẹn gặp lại bạn tại sự kiện!
                </p>
            </div>

            <div style="margin-bottom: 24px; padding: 16px; background-color: rgba(255,255,255,0.08); border-radius: 12px;">
                <h3 style="margin-top: 0; color: #ffb347 !important;">Thông tin đơn hàng</h3>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <strong style="color: white !important;">Mã đơn : </strong><span style="color: white !important;">#${data.orderInfo.orderNumber}</span>
                </div>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <strong style="color: white !important;">Khách hàng : </strong><span style="color: white !important;">${data.customerInfo.fullName}</span>
                </div>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <strong style="color: white !important;">Email : </strong><span style="color: white !important;">${data.customerInfo.email}</span>
                </div>
            </div>

            <div style="margin-bottom: 24px; padding: 16px; background-color: rgba(255,255,255,0.08); border-radius: 12px;">
                <h3 style="margin-top: 0; color: #ffb347 !important;">Chi tiết vé</h3>
                ${data.tickets.map((ticket: any) => `
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <strong style="color: white !important;">Loại vé : </strong><span style="color: white !important;">${ticket.name} - ${ticket.price.toLocaleString('vi-VN')}đ</span>
                </div>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <strong style="color: white !important;">Số lượng : </strong><span style="color: white !important;">${ticket.quantity} vé</span>
                </div>
                `).join('')}
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0;">
                    <strong style="color: white !important;">QR Code : </strong><span style="color: white !important;">Vé PDF đính kèm</span>
                </div>
            </div>

            <div style="margin-bottom: 24px; padding: 16px; background-color: rgba(255,255,255,0.08); border-radius: 12px;">
                <h3 style="margin-top: 0; color: #ffb347 !important;">Thông tin sự kiện</h3>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <strong style="color: white !important;">Sự kiện : </strong><span style="color: white !important;">${data.eventInfo.name}</span>
                </div>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <strong style="color: white !important;">Thời gian : </strong><span style="color: white !important;">${data.eventInfo.time} | ${data.eventInfo.date}</span>
                </div>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0;">
                    <strong style="color: white !important;">Địa điểm : </strong><span style="color: white !important;">${data.eventInfo.venue}</span>
                </div>
            </div>

            <div style="text-align: center; margin-top: 32px;">
                <p style="color: white !important;">Cảm ơn bạn đã đồng hành cùng Ớt Cay Xè!</p>
                <div style="margin: 20px 0; padding: 16px; background-color: rgba(255,255,255,0.08); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="margin-top: 0; color: #ffb347 !important; font-size: 16px; margin-bottom: 16px;">Thông tin hỗ trợ</h3>
                    <div style="text-align: center; line-height: 2;">
                        <p style="color: white !important; font-size: 14px; margin: 0; ">
                            Mail to :<a href="mailto:${data.organizationInfo?.contact_email || 'otconcert@gmail.com'}" style="color: #FF8C42 !important; text-decoration: none;">${data.organizationInfo?.contact_email || 'otconcert@gmail.com'}</a>
                        </p>
                        <p style="color: white !important; font-size: 14px; margin: 0;">
                            SĐT :  ${data.organizationInfo?.phone || '0934782703'} ( Trưởng BTC )
                        </p>
                        <p style="color: white !important; font-size: 14px; margin: 0;">
                            Website : <a href="${data.organizationInfo?.website || 'https://otcayxe.com'}" target="_blank" style="color: #FF8C42 !important; text-decoration: none;">${data.organizationInfo?.website || 'https://otcayxe.com'}</a>
                        </p>
                    </div>
                </div>
                <p style="font-size: 12px; opacity: 0.6; color: white !important;">
                    Vé được phân phối qua hệ thống
                    <a href="https://howlstudio.tech" target="_blank" style="color: #FF8C42 !important; text-decoration: none;">HowlsTicket</a>
                </p>
            </div>
        </div>
    </div>
</body>

</html>
`;
  }
} 