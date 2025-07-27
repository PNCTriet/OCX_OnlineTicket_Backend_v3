const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function testTicketInfoPosition() {
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

    // QR Code với vị trí cố định
    const base64Data = qrCodeDataUrl.split(',')[1];
    const imageBytes = Buffer.from(base64Data, 'base64');
    const image = await pdfDoc.embedPng(imageBytes);

    const qrScale = 1.2;
    const { width, height } = image.scale(qrScale);
    const qrX = 360; // Vị trí QR code cố định
    const qrY = 150;

    // Draw QR code
    page.drawImage(image, {
      x: qrX,
      y: qrY,
      width,
      height,
    });

    // === CÁCH ĐIỀU CHỈNH VỊ TRÍ 4 THÔNG TIN ===
    // Mỗi thông tin có thể điều chỉnh vị trí riêng
    const ticketInfo = [
      {
        // Giờ tổ chức: format "16:00 - 22:00" với dấu "-" ở giữa
        value: ticketData.eventTime ? (() => {
          const timeParts = ticketData.eventTime.split(':');
          const hour = parseInt(timeParts[0]);
          const minute = timeParts[1];
          const endHour = hour + 3;
          return `${hour}:${minute} - ${endHour}:${minute}`;
        })() : 'N/A',
        x: 105,   // Vị trí ngang - có thể thay đổi
        y: 390,  // Vị trí dọc - có thể thay đổi
        size: 35, // Kích thước font
        color: backgroundImage ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3),
        isTime: true // Đánh dấu để format đặc biệt
      },
      {
        // Ngày tổ chức: format "28 SEPTEMBER" với số và tháng có vị trí riêng
        value: ticketData.eventDate ? (() => {
          const date = new Date(ticketData.eventDate);
          const day = date.getDate();
          const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
          const month = monthNames[date.getMonth()];
          return { day: day.toString(), month: month };
        })() : { day: 'N/A', month: 'N/A' },
        x: 230,   // Vị trí ngang - có thể thay đổi
        y: 400,  // Vị trí dọc - có thể thay đổi
        size: 25, // Kích thước font
        color: backgroundImage ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3),
        isDate: true, // Đánh dấu để format đặc biệt
        // Vị trí riêng cho số và tháng
        dayX: 270, // Vị trí X của số
        dayY: 400, // Vị trí Y của số
        monthX: 240, // Vị trí X của tháng
        monthY: 380, // Vị trí Y của tháng
        daySize: 50, // Kích thước font của số
        monthSize: 20 // Kích thước font của tháng
      },
      {
        // Loại vé: in đậm
        value: ticketData.ticketType,
        x: 410,   // Vị trí ngang - có thể thay đổi
        y: 390,  // Vị trí dọc - có thể thay đổi
        size: 35, // Kích thước font
        color: backgroundImage ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3),
        isBold: true // Đánh dấu để in đậm
      },
      {
        // Người sở hữu
        value: ticketData.customerName,
        x: 200,   // Vị trí ngang - có thể thay đổi
        y: 300,  // Vị trí dọc - có thể thay đổi
        size: 14, // Kích thước font
        color: backgroundImage ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3)
      }
    ];

    // Vẽ từng thông tin với format đặc biệt
    ticketInfo.forEach((info, index) => {
      if (info.isTime) {
        // Format giờ với 2 giờ nằm dọc thẳng hàng
        const timeParts = info.value.split(' - ');
        if (timeParts.length === 2) {
          // Vẽ giờ bắt đầu (trên)
          page.drawText(timeParts[0], {
            x: info.x,
            y: info.y + 15, // Giờ trên
            size: info.size,
            font: boldFont,
            color: info.color,
          });
          
          // Vẽ giờ kết thúc (dưới)
          page.drawText(timeParts[1], {
            x: info.x, // Cùng vị trí X để thẳng hàng
            y: info.y - 15, // Giờ dưới
            size: info.size,
            font: boldFont,
            color: info.color,
          });
        } else {
          // Fallback nếu không parse được
          page.drawText(info.value, {
            x: info.x,
            y: info.y,
            size: info.size,
            font: boldFont,
            color: info.color,
          });
        }
      } else if (info.isDate) {
        // Format ngày với số in đậm và tháng ở dưới
        page.drawText(info.value.day, {
          x: info.dayX,
          y: info.dayY,
          size: info.daySize,
          font: boldFont,
          color: info.color,
        });
        
        page.drawText(info.value.month, {
          x: info.monthX,
          y: info.monthY,
          size: info.monthSize,
          font,
          color: info.color,
        });
      } else {
        // Format thông thường
        page.drawText(info.value, {
          x: info.x,
          y: info.y,
          size: info.size,
          font: info.isBold ? boldFont : font,
          color: info.color,
        });
      }

      // Thêm text để đánh dấu vị trí
      page.drawText(`Info ${index + 1}: X=${info.x}, Y=${info.y}`, {
        x: 400,
        y: info.y,
        size: 10,
        font,
        color: rgb(1, 0, 0),
      });
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('test-ticket-info-position.pdf', pdfBytes);
    
    console.log('✅ PDF generated successfully: test-ticket-info-position.pdf');
    console.log('📄 QR Code Position: X=360, Y=150, Scale=1.2');
    console.log('💡 Để thay đổi vị trí thông tin, chỉnh sửa các giá trị x, y trong ticketInfo array');
    console.log('📋 Các thông tin hiển thị:');
    ticketInfo.forEach((info, index) => {
      console.log(`   ${index + 1}. ${info.label} - X: ${info.x}, Y: ${info.y}`);
    });
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
  }
}

testTicketInfoPosition(); 