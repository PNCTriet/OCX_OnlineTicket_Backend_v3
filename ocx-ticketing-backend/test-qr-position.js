const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function testQRPosition() {
  try {
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Use standard fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Helper function to embed image
    const embedImage = async (imageUrl, pdfDoc) => {
      try {
        if (imageUrl.startsWith('data:')) {
          const base64Data = imageUrl.split(',')[1];
          const imageBytes = Buffer.from(base64Data, 'base64');
          return await pdfDoc.embedPng(imageBytes);
        } else if (imageUrl.startsWith('http')) {
          const response = await fetch(imageUrl);
          const imageBuffer = await response.arrayBuffer();
          return await pdfDoc.embedPng(imageBuffer);
        } else {
          let imagePath = path.join(__dirname, 'src/email/template', imageUrl);
          if (!fs.existsSync(imagePath)) {
            imagePath = path.join(__dirname, 'src/email/photo', imageUrl);
          }
          if (!fs.existsSync(imagePath)) {
            imagePath = path.join(__dirname, imageUrl);
          }
          
          if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            const ext = path.extname(imageUrl).toLowerCase();
            if (ext === '.jpg' || ext === '.jpeg') {
              return await pdfDoc.embedJpg(imageBuffer);
            } else {
              return await pdfDoc.embedPng(imageBuffer);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to embed image:', error);
        return null;
      }
      return null;
    };

    // Test data
    const ticketData = {
      ticketCode: 'TICKET-001',
      customerName: 'Nguyen Van A',
      eventName: 'Concert 2024',
      eventDate: '2024-12-25',
      eventTime: '19:00',
      venue: 'Ho Chi Minh City',
      ticketType: 'VIP',
      price: 500000,
      organizationName: 'OT Cay Xe',
      useTemplate: true
    };

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(ticketData.ticketCode);

    // Create page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    // Test with template
    let backgroundImage = null;
    if (ticketData.useTemplate) {
      try {
        backgroundImage = await embedImage('ETICKET_EN.jpg', pdfDoc);
        if (backgroundImage) {
          console.log('✅ Template loaded successfully');
          page.drawImage(backgroundImage, {
            x: 0,
            y: 0,
            width: 595.28,
            height: 841.89,
          });
        } else {
          console.log('❌ Template not found, using default layout');
        }
      } catch (error) {
        console.log('❌ Error loading template:', error.message);
      }
    }

    // QR Code với vị trí có thể điều chỉnh
    const base64Data = qrCodeDataUrl.split(',')[1];
    const imageBytes = Buffer.from(base64Data, 'base64');
    const image = await pdfDoc.embedPng(imageBytes);

    // === CÁCH ĐIỀU CHỈNH VỊ TRÍ QR CODE ===
    // Kích thước QR code (0.1 = nhỏ, 1.0 = to)
    const qrScale = 1.2;
    
    // Vị trí QR code:
    // qrX: 0 = bên trái, 595.28 = bên phải
    // qrY: 0 = dưới cùng, 841.89 = trên cùng
    const qrX = 360; // Vị trí ngang (có thể thay đổi)
    const qrY = 150; // Vị trí dọc (có thể thay đổi)
    
    // Các vị trí tham khảo:
    // - Giữa trang: qrX = 200, qrY = 400
    // - Góc trên bên phải: qrX = 400, qrY = 700
    // - Góc dưới bên trái: qrX = 50, qrY = 100
    // - Góc dưới bên phải: qrX = 400, qrY = 100

    const { width, height } = image.scale(qrScale);

    // Draw QR code
    page.drawImage(image, {
      x: qrX,
      y: qrY,
      width,
      height,
    });

    // Thêm text để đánh dấu vị trí
    page.drawText(`QR Position: X=${qrX}, Y=${qrY}, Scale=${qrScale}`, {
      x: 50,
      y: 800,
      size: 12,
      font,
      color: rgb(1, 0, 0),
    });

    // Ticket information - chỉ hiển thị 4 thông tin cần thiết
    // Các vị trí có thể tùy chỉnh riêng cho từng thông tin
    const ticketInfo = [
      {
        label: 'Gio to chuc:',
        value: ticketData.eventTime,
        x: 50,  // Vị trí ngang
        y: 300, // Vị trí dọc
        size: 14, // Kích thước font
        color: backgroundImage ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3)
      },
      {
        label: 'Ngay to chuc:',
        value: ticketData.eventDate,
        x: 50,
        y: 270,
        size: 14,
        color: backgroundImage ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3)
      },
      {
        label: 'Loai ve:',
        value: ticketData.ticketType,
        x: 50,
        y: 240,
        size: 14,
        color: backgroundImage ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3)
      },
      {
        label: 'Nguoi so huu:',
        value: ticketData.customerName,
        x: 50,
        y: 210,
        size: 14,
        color: backgroundImage ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3)
      }
    ];

    // Vẽ từng thông tin với vị trí riêng
    ticketInfo.forEach(info => {
      page.drawText(info.label, {
        x: info.x,
        y: info.y,
        size: info.size,
        font: boldFont,
        color: info.color,
      });
      
      page.drawText(info.value, {
        x: info.x + 120, // Khoảng cách giữa label và value
        y: info.y,
        size: info.size,
        font,
        color: info.color,
      });
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('test-qr-position.pdf', pdfBytes);
    
    console.log('✅ PDF generated successfully: test-qr-position.pdf');
    console.log(`📄 QR Code Position: X=${qrX}, Y=${qrY}, Scale=${qrScale}`);
    console.log('💡 Để thay đổi vị trí, chỉnh sửa các giá trị qrX, qrY, qrScale trong code');
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
  }
}

testQRPosition(); 