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
            
            .responsive-title {
                font-size: 24px !important;
                line-height: 1.2 !important;
                padding: 0 10px !important;
            }
            
            /* Mobile: Thay đổi màu chữ thành đen */
            .mobile-text {
                color: black !important;
                -webkit-text-fill-color: black !important;
            }
            
            .mobile-text a {
                color: #FF8C42 !important;
                -webkit-text-fill-color: #FF8C42 !important;
            }
            
            .mobile-heading {
                color: #ffb347 !important;
                -webkit-text-fill-color: #ffb347 !important;
            }
            
            .mobile-status-success {
                color: #4ade80 !important;
                -webkit-text-fill-color: #4ade80 !important;
            }
            
            .mobile-status-warning {
                color: #fbbf24 !important;
                -webkit-text-fill-color: #fbbf24 !important;
            }
            
            /* Ngăn tách cụm "Ớt Cay Xè!" */
            .brand-text {
                white-space: nowrap !important;
                display: inline-block !important;
            }
        }
        
        @media (max-width: 480px) {
            .responsive-title {
                font-size: 20px !important;
                line-height: 1.3 !important;
            }
        }
        
        @media (max-width: 360px) {
            .responsive-title {
                font-size: 18px !important;
                line-height: 1.4 !important;
            }
        }
        
        /* Force white color for dark mode compatibility */
        .white-text {
            color: white !important;
            -webkit-text-fill-color: white !important;
        }
        
        .white-text a {
            color: #FF8C42 !important;
            -webkit-text-fill-color: #FF8C42 !important;
        }
    </style>
</head>

<body style="margin:0; padding:0; font-family:Segoe UI, sans-serif;">
    <div style="
        background: linear-gradient(to bottom, rgba(255, 115, 0, 0.3), rgba(255, 115, 0, 0.3)),
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
                <h2 class="responsive-title mobile-text" style="color: white !important; font-size: 30px; font-weight: 900 !important; text-transform: uppercase !important; -webkit-text-fill-color: white !important; margin: 16px 0; word-wrap: break-word; overflow-wrap: break-word; hyphens: auto;">Vé tham dự sự kiện</h2>
                <p class="mobile-text" style="margin-top: 16px; font-size: 16px; line-height: 1.6; text-align: left; opacity: 0.9; color: white !important; -webkit-text-fill-color: white !important;">
                    Gửi ${data.customerInfo.fullName},<br />
                    Đây là xác nhận vé của bạn, tụi mình đã tổng hợp tất cả thông tin quan trọng ngay bên dưới để bạn tiện theo dõi nha. 
                    Hẹn gặp lại bạn tại sự kiện cùng <span class="brand-text">Ớt Cay Xè</span> có một vụ mùa thật bội thu kỷ niệm cùng với các nghệ sĩ!     
                </p>
            </div>

            <div style="margin-bottom: 24px; padding: 16px; background-color: rgba(255,255,255,0.08); border-radius: 12px;">
                <h3 class="mobile-heading" style="margin-top: 0; color: #ffb347 !important; -webkit-text-fill-color: #ffb347 !important;">Thông tin đơn hàng</h3>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <p class="mobile-text"><strong style="color: white !important; -webkit-text-fill-color: white !important;">Mã đơn: </strong><span style="color: white !important; -webkit-text-fill-color: white !important;">#${data.orderInfo.orderNumber}</span></p>
                </div>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <p class="mobile-text"><strong style="color: white !important; -webkit-text-fill-color: white !important;">Khách hàng: </strong><span style="color: white !important; -webkit-text-fill-color: white !important;">${data.customerInfo.fullName}</span></p>
                </div>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <p class="mobile-text"><strong style="color: white !important; -webkit-text-fill-color: white !important;">Email: </strong><span style="color: white !important; -webkit-text-fill-color: white !important;">${data.customerInfo.email}</span></p>
                </div>
            </div>

            <div style="margin-bottom: 24px; padding: 16px; background-color: rgba(255,255,255,0.08); border-radius: 12px;">
                <h3 class="mobile-heading" style="margin-top: 0; color: #ffb347 !important; -webkit-text-fill-color: #ffb347 !important;">Chi tiết vé</h3>
                ${data.tickets.map((ticket: any) => `
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <p class="mobile-text"><strong style="color: white !important; -webkit-text-fill-color: white !important;">Loại vé: </strong><span style="color: white !important; -webkit-text-fill-color: white !important;">${ticket.name} - ${ticket.price.toLocaleString('vi-VN')}đ</span></p>
                </div>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <p class="mobile-text"><strong style="color: white !important; -webkit-text-fill-color: white !important;">Số lượng: </strong><span style="color: white !important; -webkit-text-fill-color: white !important;">${ticket.quantity} vé</span></p>
                </div>
                `).join('')}
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0;">
                    <p class="mobile-text"><strong style="color: white !important; -webkit-text-fill-color: white !important;">QR Code: </strong><span style="color: white !important; -webkit-text-fill-color: white !important;">Vé PDF đính kèm</span></p>
                </div>
            </div>

            <div style="margin-bottom: 24px; padding: 16px; background-color: rgba(255,255,255,0.08); border-radius: 12px;">
                <h3 class="mobile-heading" style="margin-top: 0; color: #ffb347 !important; -webkit-text-fill-color: #ffb347 !important;">Thông tin sự kiện</h3>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <p class="mobile-text"><strong style="color: white !important; -webkit-text-fill-color: white !important;">Sự kiện: </strong><span style="color: white !important; -webkit-text-fill-color: white !important;">${data.eventInfo.name}</span></p>
                </div>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <p class="mobile-text"><strong style="color: white !important; -webkit-text-fill-color: white !important;">Thời gian: </strong><span style="color: white !important; -webkit-text-fill-color: white !important;">${data.eventInfo.time} | ${data.eventInfo.date}</span></p>
                </div>
                <div class="info-row" style="display: flex; justify-content: space-between; padding: 6px 0;">
                    <p class="mobile-text"><strong style="color: white !important; -webkit-text-fill-color: white !important;">Địa điểm: </strong><span style="color: white !important; -webkit-text-fill-color: white !important;">${data.eventInfo.venue}</span></p>
                </div>
            </div>

            <div style="text-align: center; margin-top: 32px;">
                <span class="mobile-text" style="color: white !important; -webkit-text-fill-color: white !important;">Cảm ơn bạn đã đồng hành cùng <span class="brand-text">Ớt Cay Xè!</span></span>
                <div style="margin: 20px 0; padding: 16px; background-color: rgba(255,255,255,0.08); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                    <h3 class="mobile-heading" style="margin-top: 0; color: #ffb347 !important; -webkit-text-fill-color: #ffb347 !important; font-size: 16px; margin-bottom: 16px;">Thông tin hỗ trợ</h3>
                    <div style="text-align: center; line-height: 2;">
                        <p class="mobile-text" style="color: white !important; -webkit-text-fill-color: white !important; font-size: 14px; margin: 0; ">
                            Mail to: <a href="mailto:${data.organizationInfo?.contact_email || 'otconcert@gmail.com'}" style="color: #FF8C42 !important; -webkit-text-fill-color: #FF8C42 !important; text-decoration: none;">${data.organizationInfo?.contact_email || 'otconcert@gmail.com'}</a>
                        </p>
                        <p class="mobile-text" style="color: white !important; -webkit-text-fill-color: white !important; font-size: 14px; margin: 0;">
                            SĐT: ${data.organizationInfo?.phone || '0934782703'} ( Trưởng BTC )
                        </p>
                        <p class="mobile-text" style="color: white !important; -webkit-text-fill-color: white !important; font-size: 14px; margin: 0;">
                            Website: <a href="${data.organizationInfo?.website || 'https://otcayxe.com'}" target="_blank" style="color: #FF8C42 !important; -webkit-text-fill-color: #FF8C42 !important; text-decoration: none;">${data.organizationInfo?.website || 'https://otcayxe.com'}</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
`;
    }
} 