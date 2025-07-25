# 📧 Backend Email API Specification

## 🎯 Tổng quan
Tài liệu này mô tả API endpoint để gửi email vé điện tử với PDF đính kèm từ backend.

---

## 📋 API Endpoint

### **POST** `/api/email/send-ticket`

**Mục đích:** Gửi email vé điện tử với PDF đính kèm

**Base URL:** `https://your-backend-domain.com/api/email/send-ticket`

---

## 🔧 Request Specification

### **Headers:**
```http
Content-Type: application/json
Authorization: Bearer {access_token}
```

### **Request Body:**
```json
{
  "to": "customer@example.com",
  "subject": "🎫 Vé điện tử Ớt Cay Xè - Đơn hàng #OCX4-1501-143025-02-12345678",
  "customerInfo": {
    "fullName": "Nguyễn Văn A",
    "email": "customer@example.com",
    "phone": "0123456789"
  },
  "orderInfo": {
    "orderNumber": "OCX4-1501-143025-02-12345678",
    "orderDate": "15/01/2025",
    "orderTime": "14:30:25",
    "totalAmount": 1798000
  },
  "tickets": [
    {
      "id": "ticket-001",
      "name": "VIP Ticket",
      "price": 899000,
      "quantity": 2,
      "color": "#F06185",
      "label": "Khu vực A"
    },
    {
      "id": "ticket-002", 
      "name": "General Ticket",
      "price": 500000,
      "quantity": 1,
      "color": "#4CAF50",
      "label": "Khu vực B"
    }
  ],
  "eventInfo": {
    "name": "Ớt Cay Xè - The destination of Indie music",
    "date": "27/09/2025",
    "time": "19:00",
    "venue": "Quận Sài Gòn",
    "address": "123 Đường ABC, Quận 1, TP.HCM"
  }
}
```

---

## 📧 Email Template Specification

### **1. HTML Email Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vé điện tử Ớt Cay Xè</title>
  <style>
    body { 
      font-family: 'Inter', Arial, sans-serif; 
      margin: 0; 
      padding: 0; 
      background-color: #f4f4f4; 
      line-height: 1.6;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff; 
      border-radius: 10px; 
      overflow: hidden; 
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
    }
    .header { 
      background: linear-gradient(135deg, #c53e00 0%, #ff6b35 100%); 
      color: white; 
      padding: 30px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0; 
      font-size: 28px; 
      font-weight: 800; 
    }
    .content { 
      padding: 30px; 
    }
    .intro-text {
      background-color: #fff3cd;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #c53e00;
    }
    .ticket-info { 
      background-color: #f8f9fa; 
      border-radius: 8px; 
      padding: 20px; 
      margin: 20px 0; 
      border: 2px solid #c53e00;
    }
    .ticket-item { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 10px 0; 
      border-bottom: 1px solid #e9ecef; 
    }
    .ticket-item:last-child { 
      border-bottom: none; 
    }
    .total { 
      font-weight: bold; 
      font-size: 18px; 
      color: #c53e00; 
      text-align: right; 
      margin-top: 20px; 
      padding-top: 20px; 
      border-top: 2px solid #c53e00; 
    }
    .customer-info { 
      background-color: #e8f4fd; 
      border-radius: 8px; 
      padding: 20px; 
      margin: 20px 0; 
    }
    .order-details { 
      background-color: #fff3cd; 
      border-radius: 8px; 
      padding: 20px; 
      margin: 20px 0; 
    }
    .event-details {
      background-color: #d4edda;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #28a745;
    }
    .terms { 
      background-color: #f8d7da; 
      border-radius: 8px; 
      padding: 20px; 
      margin: 20px 0; 
      border-left: 4px solid #dc3545;
    }
    .contact-info {
      background-color: #d1ecf1;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #17a2b8;
    }
    .footer { 
      background-color: #343a40; 
      color: white; 
      text-align: center; 
      padding: 20px; 
      font-size: 14px; 
    }
    .qr-code { 
      text-align: center; 
      margin: 20px 0; 
    }
    .qr-code img { 
      width: 150px; 
      height: 150px; 
      border: 2px solid #c53e00; 
      border-radius: 8px; 
    }
    .highlight {
      color: #c53e00;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎫 Vé điện tử Ớt Cay Xè</h1>
      <p>Chào mừng bạn đến với đêm nhạc!</p>
    </div>
    
    <div class="content">
      <div class="intro-text">
        <p><strong>Ớt Cay Xè</strong> xin được gửi tặng bạn vé đêm nhạc nhé, mong bạn sẽ có những phút giây vui vẻ nhất khi tận hưởng âm nhạc cùng bạn bè và người thân.</p>
        <p>Vui lòng kiểm tra thông tin và chuẩn bị sẵn vé tại nơi soát vé.</p>
      </div>
      
      <div class="order-details">
        <h3>📋 Thông tin đơn hàng</h3>
        <p><strong>Mã đơn hàng:</strong> #${orderNumber}</p>
        <p><strong>Ngày đặt:</strong> ${orderDate} ${orderTime}</p>
      </div>
      
      <div class="customer-info">
        <h3>👤 Thông tin khách hàng</h3>
        <p><strong>Họ tên:</strong> ${customerInfo.fullName}</p>
        <p><strong>Email:</strong> ${customerInfo.email}</p>
        <p><strong>Số điện thoại:</strong> ${customerInfo.phone}</p>
      </div>
      
      <div class="ticket-info">
        <h3>🎭 THÔNG TIN VÉ</h3>
        ${tickets.map(ticket => `
          <div class="ticket-item">
            <div>
              <strong>Loại vé:</strong> ${ticket.name}<br>
              <small>Mã vé: ${ticket.id}</small>
            </div>
            <div>
              <strong>Số lượng: ${ticket.quantity}</strong><br>
              <small>${ticket.price.toLocaleString()}đ/vé</small>
            </div>
          </div>
        `).join('')}
        <div class="total">
          <strong>Tổng cộng: ${totalAmount.toLocaleString()}đ</strong>
        </div>
      </div>
      
      <div class="event-details">
        <h3>📅 Thông tin sự kiện</h3>
        <p><strong>Thời gian:</strong> ${eventInfo.date} ${eventInfo.time}</p>
        <p><strong>Địa điểm:</strong> ${eventInfo.venue}</p>
        <p><strong>Địa chỉ:</strong> ${eventInfo.address}</p>
      </div>
      
      <div class="terms">
        <h3>📋 Điều khoản và điều kiện</h3>
        <ul>
          <li>Mỗi vé chỉ dành cho 1 (một) người vào cửa.</li>
          <li>Người tham gia phải trình vé ở cửa để vào sự kiện.</li>
          <li>Người nhận vé tự chịu trách nhiệm bảo mật thông tin mã vé.</li>
          <li>Không hỗ trợ giữ chỗ dưới mọi hình thức.</li>
        </ul>
      </div>
      
      <div class="qr-code">
        <h3>📱 Mã QR vé</h3>
        <p>Quét mã QR này tại cửa vào để được kiểm tra vé</p>
        ${generateQRCodes()}
      </div>
      
      <div class="contact-info">
        <h3>📞 Mọi thắc mắc xin liên hệ</h3>
        <p><strong>💌 Email:</strong> otconcert@gmail.com</p>
        <p><strong>☎️ Phone:</strong> 0934782703 - Bora</p>
        <p><strong>✨ Fanpage:</strong> Fanpage chương trình</p>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2024 Ớt Cay Xè - The destination of Indie music</p>
      <p>Follow Ớt Cay Xè để cập nhật thêm thông tin về đêm nhạc nhé!</p>
    </div>
  </div>
</body>
</html>
```

### **2. PDF Generation Specification:**

**Thư viện đề xuất:** Puppeteer hoặc jsPDF

**PDF Structure:**
```
┌─────────────────────────────────────┐
│           ỚT CAY XÈ                │
│      VÉ ĐIỆN TỬ                    │
├─────────────────────────────────────┤
│                                     │
│  🎫 Mã vé: OCX4-001-01             │
│  👤 Khách hàng: Nguyễn Văn A       │
│  📅 Ngày: 27/09/2025               │
│  🕐 Giờ: 19:00                     │
│  📍 Địa điểm: Quận Sài Gòn        │
│  🎭 Loại vé: VIP Ticket            │
│  💰 Giá: 899,000đ                  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │         QR CODE             │    │
│  │     (150x150px)            │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  📋 Điều khoản:                    │
│  • Mỗi vé chỉ dành cho 1 người     │
│  • Trình vé tại cửa để vào sự kiện │
│  • Không hỗ trợ giữ chỗ           │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔧 Backend Implementation Guide

### **1. Dependencies cần thiết:**
```json
{
  "dependencies": {
    "puppeteer": "^21.0.0",
    "nodemailer": "^6.9.0",
    "qrcode": "^1.5.0",
    "handlebars": "^4.7.0"
  }
}
```

### **2. Email Service Setup:**
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail', // hoặc SMTP server khác
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### **3. PDF Generation với Puppeteer:**
```javascript
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');

async function generateTicketPDF(ticketData) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Generate QR code
  const qrCodeDataUrl = await QRCode.toDataURL(ticketData.qrCode);
  
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .ticket { border: 2px solid #c53e00; padding: 20px; max-width: 400px; }
        .header { text-align: center; color: #c53e00; font-size: 24px; font-weight: bold; }
        .qr-code { text-align: center; margin: 20px 0; }
        .info { margin: 10px 0; }
        .terms { font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">ỚT CAY XÈ - VÉ ĐIỆN TỬ</div>
        <div class="info">🎫 Mã vé: ${ticketData.ticketId}</div>
        <div class="info">👤 Khách hàng: ${ticketData.customerName}</div>
        <div class="info">📅 Ngày: ${ticketData.eventDate}</div>
        <div class="info">🕐 Giờ: ${ticketData.eventTime}</div>
        <div class="info">📍 Địa điểm: ${ticketData.venue}</div>
        <div class="info">🎭 Loại vé: ${ticketData.ticketType}</div>
        <div class="info">💰 Giá: ${ticketData.price.toLocaleString()}đ</div>
        <div class="qr-code">
          <img src="${qrCodeDataUrl}" width="150" height="150" />
        </div>
        <div class="terms">
          <strong>📋 Điều khoản:</strong><br>
          • Mỗi vé chỉ dành cho 1 người<br>
          • Trình vé tại cửa để vào sự kiện<br>
          • Không hỗ trợ giữ chỗ
        </div>
      </div>
    </body>
    </html>
  `;
  
  await page.setContent(htmlContent);
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
  });
  
  await browser.close();
  return pdf;
}
```

### **4. API Endpoint Implementation:**
```javascript
app.post('/api/email/send-ticket', async (req, res) => {
  try {
    const { to, subject, customerInfo, orderInfo, tickets, eventInfo } = req.body;
    
    // Validate input
    if (!to || !customerInfo || !tickets || tickets.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Generate PDF for each ticket
    const pdfAttachments = [];
    let ticketCounter = 1;
    
    for (const ticket of tickets) {
      for (let i = 0; i < ticket.quantity; i++) {
        const ticketNumber = ticketCounter.toString().padStart(2, '0');
        const ticketId = `${orderInfo.orderNumber}-${ticketNumber}`;
        
        const ticketData = {
          ticketId,
          customerName: customerInfo.fullName,
          eventDate: eventInfo.date,
          eventTime: eventInfo.time,
          venue: eventInfo.venue,
          ticketType: ticket.name,
          price: ticket.price,
          qrCode: ticketId
        };
        
        const pdfBuffer = await generateTicketPDF(ticketData);
        
        pdfAttachments.push({
          filename: `ve-${ticketId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        });
        
        ticketCounter++;
      }
    }
    
    // Generate HTML email content
    const htmlContent = generateEmailHTML({
      customerInfo,
      orderInfo,
      tickets,
      eventInfo
    });
    
    // Send email with PDF attachments
    const mailOptions = {
      from: 'Ớt Cay Xè <noreply@otcayxe.com>',
      to: to,
      subject: subject,
      html: htmlContent,
      attachments: pdfAttachments
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      ticketsSent: pdfAttachments.length
    });
    
  } catch (error) {
    console.error('Error sending ticket email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email'
    });
  }
});
```

---

## 📊 Response Format

### **Success Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "ticketsSent": 3,
  "orderNumber": "OCX4-1501-143025-02-12345678",
  "sentAt": "2025-01-15T14:30:25.000Z"
}
```

### **Error Response:**
```json
{
  "success": false,
  "error": "Failed to send email",
  "details": "Invalid email address"
}
```

---

## 🔒 Security Considerations

### **1. Input Validation:**
- Validate email format
- Sanitize HTML content
- Check file size limits
- Validate ticket data structure

### **2. Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many email requests, please try again later'
});

app.use('/api/email/send-ticket', emailLimiter);
```

### **3. Authentication:**
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/email/send-ticket', authenticateToken, async (req, res) => {
  // Implementation
});
```

---

## 🧪 Testing

### **1. Test Data:**
```json
{
  "to": "test@example.com",
  "subject": "🎫 Test Email - Vé điện tử Ớt Cay Xè",
  "customerInfo": {
    "fullName": "Nguyễn Văn Test",
    "email": "test@example.com",
    "phone": "0123456789"
  },
  "orderInfo": {
    "orderNumber": "TEST-001",
    "orderDate": "15/01/2025",
    "orderTime": "14:30:25",
    "totalAmount": 1798000
  },
  "tickets": [
    {
      "id": "test-ticket-1",
      "name": "VIP Ticket",
      "price": 899000,
      "quantity": 2,
      "color": "#F06185",
      "label": "Khu vực A"
    }
  ],
  "eventInfo": {
    "name": "Ớt Cay Xè - Test Event",
    "date": "27/09/2025",
    "time": "19:00",
    "venue": "Test Venue",
    "address": "123 Test Street, Test City"
  }
}
```

### **2. Test Commands:**
```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/email/send-ticket \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @test-data.json
```

---

## 📋 Checklist Implementation

### **Backend Setup:**
- [ ] Install dependencies (puppeteer, nodemailer, qrcode)
- [ ] Configure email service (SMTP/Gmail)
- [ ] Set up environment variables
- [ ] Implement PDF generation
- [ ] Create email template
- [ ] Add authentication middleware
- [ ] Implement rate limiting
- [ ] Add error handling
- [ ] Test with sample data

### **Frontend Integration:**
- [ ] Update API calls to use new backend endpoint
- [ ] Handle success/error responses
- [ ] Update loading states
- [ ] Test email sending flow

---

## 🚀 Deployment Notes

### **Environment Variables:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

### **Server Requirements:**
- Node.js 16+
- Sufficient memory for Puppeteer (512MB+)
- Email service credentials
- SSL certificate for production

### **Docker Setup (Optional):**
```dockerfile
FROM node:16-alpine

# Install Puppeteer dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📞 Support

Nếu có vấn đề về implementation, liên hệ:
- **Email:** dev@otcayxe.com
- **Documentation:** https://docs.otcayxe.com
- **GitHub Issues:** https://github.com/otcayxe/backend/issues 