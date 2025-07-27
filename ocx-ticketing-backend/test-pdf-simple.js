const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function testPDFTemplate() {
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
          // Local file path - check multiple directories
          let imagePath = path.join(__dirname, 'src/email/template', imageUrl);
          console.log('Looking for template at:', imagePath);
          if (!fs.existsSync(imagePath)) {
            // Check photo directory
            imagePath = path.join(__dirname, 'src/email/photo', imageUrl);
            console.log('Looking for template at:', imagePath);
          }
          if (!fs.existsSync(imagePath)) {
            // Check current directory
            imagePath = path.join(__dirname, imageUrl);
            console.log('Looking for template at:', imagePath);
          }
          
          if (fs.existsSync(imagePath)) {
            console.log('✅ Template file found at:', imagePath);
            const imageBuffer = fs.readFileSync(imagePath);
            
            // Check file extension to determine format
            const ext = path.extname(imageUrl).toLowerCase();
            if (ext === '.jpg' || ext === '.jpeg') {
              return await pdfDoc.embedJpg(imageBuffer);
            } else {
              return await pdfDoc.embedPng(imageBuffer);
            }
          } else {
            console.log('❌ Template file not found in any directory');
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

    // Background gradient effect (only when not using template)
    if (!backgroundImage) {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: 595.28,
        height: 841.89,
        color: rgb(0.98, 0.98, 0.98),
      });
    }

    // Header section (only when not using template)
    if (!backgroundImage) {
      page.drawRectangle({
        x: 0,
        y: 750,
        width: 595.28,
        height: 91.89,
        color: rgb(0.2, 0.2, 0.2),
      });
    }

    // Title (only when not using template)
    if (!backgroundImage) {
      page.drawText('VE DIEN TU', {
        x: 50,
        y: 800,
        size: 32,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      page.drawText('ELECTRONIC TICKET', {
        x: 50,
        y: 770,
        size: 14,
        font,
        color: rgb(0.8, 0.8, 0.8),
      });
    }

    // QR Code
    const base64Data = qrCodeDataUrl.split(',')[1];
    const imageBytes = Buffer.from(base64Data, 'base64');
    const image = await pdfDoc.embedPng(imageBytes);

    const { width, height } = image.scale(1.2); // Tăng từ 0.25 lên 0.4
    const qrX = (595.28 - width) / 2;
    const qrY = backgroundImage ? 400 : 500;

    // QR code background (only when not using template)
    if (!backgroundImage) {
      page.drawRectangle({
        x: qrX - 10,
        y: qrY - 10,
        width: width + 20,
        height: height + 20,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });
    }

    page.drawImage(image, {
      x: qrX,
      y: qrY,
      width,
      height,
    });

    // QR code label (only when not using template)
    if (!backgroundImage) {
      page.drawText('Quet ma QR de xac nhan', {
        x: qrX,
        y: qrY - 30,
        size: 12,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    // Ticket information
    let currentY = backgroundImage ? 300 : 450;

    // Section title (only when not using template)
    if (!backgroundImage) {
      page.drawText('THONG TIN VE', {
        x: 50,
        y: currentY,
        size: 18,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentY -= 30;
    }

    // Info grid
    const infoData = [
      { label: 'Ma ve:', value: ticketData.ticketCode },
      { label: 'Khach hang:', value: ticketData.customerName },
      { label: 'Su kien:', value: ticketData.eventName },
      { label: 'Ngay:', value: ticketData.eventDate },
      { label: 'Gio:', value: ticketData.eventTime },
      { label: 'Dia diem:', value: ticketData.venue },
      { label: 'Loai ve:', value: ticketData.ticketType },
      { label: 'Gia:', value: `${ticketData.price.toLocaleString()} VND` },
    ];

    infoData.forEach((item, index) => {
      const x = index % 2 === 0 ? 70 : 320;
      const yOffset = Math.floor(index / 2) * 25;
      
      page.drawText(item.label, {
        x,
        y: currentY - yOffset,
        size: 12,
        font: boldFont,
        color: backgroundImage ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3),
      });
      
      page.drawText(item.value, {
        x: x + 80,
        y: currentY - yOffset,
        size: 12,
        font,
        color: backgroundImage ? rgb(0, 0, 0) : rgb(0.4, 0.4, 0.4),
      });
    });

    // Footer (only when not using template)
    if (!backgroundImage) {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: 595.28,
        height: 80,
        color: rgb(0.95, 0.95, 0.95),
      });

      page.drawText('Luu y:', {
        x: 50,
        y: 50,
        size: 12,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });

      page.drawText('• Mang theo ve khi den su kien', {
        x: 70,
        y: 35,
        size: 10,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });

      page.drawText('• Lien he: support@otcayxe.com', {
        x: 70,
        y: 20,
        size: 10,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });

      page.drawText(`© 2024 ${ticketData.organizationName} - All rights reserved`, {
        x: 350,
        y: 20,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('test-template.pdf', pdfBytes);
    
    console.log('✅ PDF generated successfully: test-template.pdf');
    console.log(`📄 Template used: ${backgroundImage ? 'YES' : 'NO'}`);
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
  }
}

testPDFTemplate(); 