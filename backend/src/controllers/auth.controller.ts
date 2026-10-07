import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';
import nodemailer from 'nodemailer';

// Bảng lưu trữ OTP tạm thời trong bộ nhớ (In-memory)
const otpStore = new Map<string, { otp: string, expires: number }>();

// Hàm khởi tạo transporter linh hoạt, luôn đọc thông tin mới nhất từ process.env
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' });
    }

    const emailNormalized = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: emailNormalized } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email này đã được sử dụng cho một tài khoản khác' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultRole = await prisma.role.findUnique({ where: { code: 'USER' } });
    const defaultLevel = await prisma.membershipLevel.findUnique({ where: { code: 'STAR' } });

    const user = await prisma.user.create({
      data: {
        email: emailNormalized,
        password: hashedPassword,
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        roleId: defaultRole?.id || null,
        membershipLevelId: defaultLevel?.id || null
      },
      include: {
        roleDetail: true,
        membership: true
      }
    });

    res.status(201).json({ 
      message: 'Đăng ký tài khoản thành công!', 
      user: { id: user.id, email: user.email, name: user.name, role: user.roleDetail?.code || 'USER' } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo tài khoản', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ 
      where: { email: emailNormalized },
      include: {
        roleDetail: true,
        membership: true
      }
    });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const roleName = user.roleDetail?.code || 'USER';
    const membershipName = user.membership?.code || 'STAR';

    const token = jwt.sign(
      { id: user.id, email: user.email, role: roleName },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: roleName,
        avatar: user.avatar,
        phone: user.phone,
        rewardPoints: user.rewardPoints,
        membershipLevel: membershipName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đăng nhập hệ thống', error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ email' });
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailNormalized } });
    if (!user) {
      return res.status(404).json({ message: 'Địa chỉ email này chưa được đăng ký trong hệ thống' });
    }

    // Tạo mã OTP 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // OTP hết hạn sau 5 phút
    otpStore.set(emailNormalized, { otp, expires: Date.now() + 5 * 60 * 1000 });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"AEON CINE Việt Nam" <${process.env.EMAIL_USER}>`,
        to: emailNormalized,
        subject: `[AEON CINE] Mã xác nhận OTP đặt lại mật khẩu: ${otp}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #07090d; color: #ffffff; margin: 0; padding: 24px 10px; }
              .container { max-width: 560px; margin: 0 auto; background: #0d1117; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 32px 24px; text-align: center; }
              .header h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; }
              .header p { margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2.5px; color: rgba(255,255,255,0.9); font-weight: 600; text-transform: uppercase; }
              .body { padding: 36px 28px; color: #e2e8f0; line-height: 1.6; }
              .greeting { font-size: 17px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
              .otp-card { background: linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(234, 88, 12, 0.04) 100%); border: 2px dashed #f59e0b; border-radius: 18px; padding: 24px; text-align: center; margin: 26px 0; }
              .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #f59e0b; font-weight: 800; margin-bottom: 8px; }
              .otp-code { font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #fbbf24; font-family: 'Courier New', Courier, monospace; margin: 0; }
              .warning { background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 14px 18px; border-radius: 8px; font-size: 13px; color: #fca5a5; margin: 22px 0; }
              .footer { background: #07090d; padding: 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); }
              .footer strong { color: #94a3b8; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>AEON CINE</h1>
                <p>HỆ THỐNG RẠP CHIẾU PHIM TIÊU CHUẨN QUỐC TẾ</p>
              </div>
              <div class="body">
                <div class="greeting">Xin chào ${user.name || 'Khách hàng'},</div>
                <p style="font-size: 14px; color: #cbd5e1; margin: 0 0 16px 0;">
                  Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản đăng ký với email: <strong style="color: #ffffff;">${emailNormalized}</strong>.
                </p>
                <div class="otp-card">
                  <div class="otp-label">MÃ XÁC NHẬN BẢO MẬT (OTP)</div>
                  <div class="otp-code">${otp}</div>
                </div>
                <div class="warning">
                  ⏱ <strong>Thời hạn hiệu lực:</strong> Mã OTP có hiệu lực trong <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai để bảo vệ điểm thưởng và tài khoản thành viên của bạn.
                </div>
                <p style="font-size: 12px; color: #94a3b8; margin: 20px 0 0 0;">
                  Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ hotline để được hỗ trợ bảo vệ tài khoản ngay lập tức.
                </p>
              </div>
              <div class="footer">
                <p style="margin: 0 0 6px 0;"><strong>CÔNG TY TNHH AEON CINE VIỆT NAM</strong></p>
                <p style="margin: 0;">Tổng đài hỗ trợ: 1900 2224 (8:00 - 22:00) | Email: support@aeoncine.vn</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
      console.log(`[EMAIL SENT] Đã gửi mã OTP thực tế đến ${emailNormalized}`);
      res.json({ 
        message: `Mã OTP đã được gửi đến email ${emailNormalized}. Vui lòng kiểm tra hộp thư.`
      });
    } else {
      console.log(`[MOCK EMAIL] OTP: ${otp} cho email: ${emailNormalized}`);
      res.json({ message: 'Mã OTP đã được tạo (in ra terminal do chưa cấu hình EMAIL thật)' });
    }
  } catch (error) {
    console.error('Lỗi gửi email OTP:', error);
    res.status(500).json({ message: 'Không thể gửi email OTP. Vui lòng thử lại sau ít phút.', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ email, mã OTP và mật khẩu mới' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const emailNormalized = email.trim().toLowerCase();
    const storedOtp = otpStore.get(emailNormalized);

    if (!storedOtp) {
      return res.status(400).json({ message: 'Mã OTP không tồn tại hoặc chưa được yêu cầu' });
    }

    if (Date.now() > storedOtp.expires) {
      otpStore.delete(emailNormalized);
      return res.status(400).json({ message: 'Mã OTP đã hết hạn (chỉ có hiệu lực trong 5 phút). Vui lòng yêu cầu mã mới.' });
    }

    if (storedOtp.otp.trim() !== otp.trim()) {
      return res.status(400).json({ message: 'Mã OTP không chính xác. Vui lòng kiểm tra lại trong email.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: emailNormalized },
      data: { password: hashedPassword }
    });

    // Xóa OTP sau khi sử dụng thành công
    otpStore.delete(emailNormalized);

    res.json({ message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới.' });
  } catch (error) {
    console.error('Lỗi đặt lại mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi xử lý đặt lại mật khẩu', error });
  }
};
