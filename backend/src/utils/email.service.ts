import nodemailer from 'nodemailer';

const getTransporter = () => {
  const user = process.env.EMAIL_USER || process.env.MAIL_USERNAME;
  const pass = process.env.EMAIL_PASS || process.env.MAIL_PASSWORD;
  
  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: process.env.MAIL_SERVER || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
      user,
      pass
    }
  });
};

export interface TicketEmailParams {
  toEmail: string;
  userName: string;
  ticketCode: string;
  movieTitle: string;
  cinemaName: string;
  roomName: string;
  showtime: string;
  seats: string;
  foodItems?: string;
  paymentMethod?: string;
  total: number;
  qrCodeDataUrl: string;
}

export const sendTicketEmail = async (params: TicketEmailParams) => {
  const {
    toEmail,
    userName,
    ticketCode,
    movieTitle,
    cinemaName,
    roomName,
    showtime,
    seats,
    foodItems,
    paymentMethod = 'Thanh toán trực tuyến',
    total,
    qrCodeDataUrl
  } = params;

  const transporter = getTransporter();
  const formattedTotal = total ? total.toLocaleString('vi-VN') : '0';

  const htmlContent = `
    <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #07090d; color: #f4f4f5; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
      <!-- Header Banner with Golden Cinema Aura -->
      <div style="background: linear-gradient(135deg, #181102 0%, #2b1704 50%, #0d0802 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #f59e0b; position: relative;">
        <h1 style="margin: 0; color: #f59e0b; font-size: 32px; font-weight: 900; letter-spacing: 2px;">AEON<span style="color: #ffffff;">CINE</span></h1>
        <p style="margin: 6px 0 0 0; color: #fef08a; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px;">Xác Nhận Vé Điện Tử • Prestige Boarding Pass</p>
      </div>

      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #e4e4e7; margin-top: 0;">Xin chào <strong style="color: #f59e0b;">${userName || 'Quý khách'}</strong>,</p>
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">Cảm ơn bạn đã lựa chọn trải nghiệm điện ảnh tại <strong>Aeon Cine</strong>. Giao dịch đặt vé của bạn đã được xác nhận thành công.</p>

        <!-- Boarding Pass E-Ticket Card -->
        <div style="background-color: #ffffff; color: #18181b; border-radius: 16px; padding: 26px 20px; margin: 28px 0; text-align: center; box-shadow: 0 15px 35px rgba(245, 158, 11, 0.15); border: 2px solid #fde68a;">
          <p style="font-size: 11px; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin: 0 0 6px 0;">Mã Vé Check-in Tại Cổng Soát Vé</p>
          <h2 style="font-size: 26px; font-weight: 900; color: #d97706; margin: 0 0 18px 0; letter-spacing: 3px; font-family: monospace;">${ticketCode}</h2>
          
          <div style="margin: 12px 0 16px 0; display: inline-block;">
            <img src="cid:ticket_qrcode" alt="QR Code Check-in" style="width: 190px; height: 190px; border-radius: 12px; border: 2px solid #e4e4e7; padding: 4px; background: #fff;" />
          </div>
          
          <p style="font-size: 12px; color: #52525b; margin: 4px 0 0 0; font-weight: 600;">
            Quý khách chỉ cần xuất trình mã QR này tại cổng rạp trước giờ chiếu 10 phút.
          </p>
        </div>

        <!-- Showtime Details Box -->
        <div style="background-color: #0d1117; border-radius: 14px; padding: 22px; border: 1px solid rgba(255,255,255,0.08);">
          <h3 style="color: #f59e0b; font-size: 15px; margin: 0 0 16px 0; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
            🎬 Thông Tin Suất Chiếu & Ghế Ngồi
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #71717a;">Tên phim:</td>
              <td style="padding: 8px 0; font-weight: 800; text-align: right; color: #ffffff; font-size: 15px;">${movieTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a;">Rạp & Phòng chiếu:</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #f4f4f5;">${cinemaName} • ${roomName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a;">Suất chiếu:</td>
              <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #fbbf24; font-family: monospace;">${showtime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a;">Ghế đã chọn:</td>
              <td style="padding: 8px 0; font-weight: 800; text-align: right; color: #f59e0b; font-family: monospace; font-size: 15px;">${seats}</td>
            </tr>
            ${foodItems ? `
            <tr>
              <td style="padding: 8px 0; color: #71717a;">Bắp nước (Combo):</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #e4e4e7;">${foodItems}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #71717a;">Phương thức:</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #a1a1aa;">${paymentMethod}</td>
            </tr>
            <tr style="border-top: 1px dashed rgba(255,255,255,0.15);">
              <td style="padding: 14px 0 0 0; color: #a1a1aa; font-weight: 700;">Tổng thanh toán:</td>
              <td style="padding: 14px 0 0 0; font-weight: 900; font-size: 18px; text-align: right; color: #34d399; font-family: monospace;">${formattedTotal} VNĐ</td>
            </tr>
          </table>
        </div>

        <p style="color: #71717a; font-size: 12px; margin-top: 24px; text-align: center; line-height: 1.6;">
          Nếu quý khách cần hỗ trợ đổi vé hoặc giải đáp thắc mắc, vui lòng liên hệ Hotline <strong>1900-8888</strong> hoặc phản hồi trực tiếp qua email này.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #040608; padding: 20px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid rgba(255,255,255,0.06);">
        © 2026 AEON CINE Cinema Entertainment. Chúc bạn có những phút giây điện ảnh tuyệt vời!
      </div>
    </div>
  `;

  // Base64 QR code image extraction for CID attachment
  const base64Data = qrCodeDataUrl.replace(/^data:image\/\w+;base64,/, '');
  const qrBuffer = Buffer.from(base64Data, 'base64');
  const senderEmail = process.env.EMAIL_USER || process.env.MAIL_USERNAME || 'tickets@aeoncine.vn';

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Aeon Cine Cinema" <${senderEmail}>`,
        to: toEmail,
        subject: `[AEON CINE] Vé điện tử #${ticketCode} - ${movieTitle}`,
        html: htmlContent,
        attachments: [
          {
            filename: `ticket-qr-${ticketCode}.png`,
            content: qrBuffer,
            cid: 'ticket_qrcode'
          }
        ]
      });
      console.log(`[SMTP EMAIL SUCCESS] Vé điện tử #${ticketCode} đã được gửi thành công tới: ${toEmail}`);
      return true;
    } catch (err: any) {
      console.error('[SMTP EMAIL ERROR] Không thể gửi email vé thật:', err?.message || err);
      return false;
    }
  } else {
    console.log(`\n================== [MOCK EMAIL VÉ ĐIỆN TỬ] ==================`);
    console.log(`Gửi tới: ${toEmail}`);
    console.log(`Mã vé: ${ticketCode} | Phim: ${movieTitle} | Rạp: ${cinemaName} (${roomName})`);
    console.log(`Suất chiếu: ${showtime} | Ghế: ${seats} | Tổng: ${formattedTotal}đ`);
    console.log(`=============================================================\n`);
    return false;
  }
};
