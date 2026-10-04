import { Request, Response } from 'express';
import QRCode from 'qrcode';
import crypto from 'crypto';
import Stripe from 'stripe';
import prisma from '../prismaClient';
import { sendTicketEmail } from '../utils/email.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * Khởi tạo URL thanh toán cho đơn hàng (VNPay hoặc Stripe)
 */
export const createPaymentUrl = async (req: Request, res: Response) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'Mã đơn hàng (bookingId) không hợp lệ hoặc thiếu' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        tickets: {
          include: {
            seat: true,
            showtime: {
              include: {
                movie: true,
                room: {
                  include: {
                    cinema: true
                  }
                }
              }
            }
          }
        },
        foodItems: {
          include: {
            food: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // 1. THANH TOÁN STRIPE CHECKOUT QUỐC TẾ
    if (paymentMethod === 'STRIPE') {
      const firstTicket = booking.tickets && booking.tickets.length > 0 ? booking.tickets[0] : null;
      const movieTitle = firstTicket?.showtime?.movie?.title || 'Vé Xem Phim Aeon Cine';
      const cinemaName = firstTicket?.showtime?.room?.cinema?.name || 'Aeon Cine';
      const roomName = firstTicket?.showtime?.room?.name || 'Phòng chiếu';
      const seatNames = booking.tickets.map(t => t.seat.name).join(', ') || 'Ghế đã chọn';
      const startTimeStr = firstTicket?.showtime?.startTime 
        ? new Date(firstTicket.showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
        : '';

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: `AEON CINE: ${movieTitle}`,
              description: `Rạp: ${cinemaName} (${roomName}) • Suất: ${startTimeStr} • Ghế: ${seatNames}`,
              images: firstTicket?.showtime?.movie?.posterUrl ? [firstTicket.showtime.movie.posterUrl] : []
            },
            unit_amount: Math.round(Number(booking.total))
          },
          quantity: 1
        }
      ];

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        customer_email: booking.user?.email || undefined,
        client_reference_id: booking.id,
        success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&bookingId=${booking.id}`,
        cancel_url: `${frontendUrl}/payment/cancel?bookingId=${booking.id}`,
        metadata: {
          bookingId: booking.id,
          userId: booking.userId,
          ticketCode: booking.ticketCode || ''
        }
      });

      return res.json({
        paymentUrl: session.url,
        sessionId: session.id,
        message: 'Khởi tạo cổng thanh toán quốc tế Stripe thành công'
      });
    }

    // 2. THANH TOÁN VNPAY SANDBOX
    if (paymentMethod === 'VNPAY') {
      const tmnCode = process.env.VNPAY_TMN_CODE || '2QXPPB49';
      const secretKey = process.env.VNPAY_HASH_SECRET || 'ZKCBDGHJKLPOIUYTREWQSDFGHJKLMNBV';
      const vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
      const returnUrl = `${frontendUrl}/profile`;

      const date = new Date();
      const createDate = date.getFullYear().toString() +
        ('0' + (date.getMonth() + 1)).slice(-2) +
        ('0' + date.getDate()).slice(-2) +
        ('0' + date.getHours()).slice(-2) +
        ('0' + date.getMinutes()).slice(-2) +
        ('0' + date.getSeconds()).slice(-2);

      const orderId = booking.id;
      const amount = booking.total * 100;

      let vnp_Params: Record<string, string> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan ve xem phim Aeon Cine #${booking.ticketCode || orderId}`,
        vnp_OrderType: 'other',
        vnp_Amount: amount.toString(),
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: '127.0.0.1',
        vnp_CreateDate: createDate,
      };

      const sortedParams = Object.keys(vnp_Params).sort().reduce((acc: Record<string, string>, key) => {
        acc[key] = vnp_Params[key];
        return acc;
      }, {});

      const signData = new URLSearchParams(sortedParams).toString();
      const hmac = crypto.createHmac('sha512', secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      const paymentUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;

      return res.json({
        paymentUrl,
        message: 'Khởi tạo cổng thanh toán VNPay Sandbox thành công'
      });
    }

    // 3. MẶC ĐỊNH
    const redirectUrl = `${frontendUrl}/profile`;
    res.json({
      paymentUrl: redirectUrl,
      message: 'Khởi tạo thanh toán thành công'
    });
  } catch (error: any) {
    console.error('Error creating payment URL:', error);
    res.status(500).json({ message: 'Error creating payment URL', error: error?.message || error });
  }
};

/**
 * Hàm dùng chung xác nhận hoàn tất đặt vé & gửi email hóa đơn E-Ticket
 */
async function completeBookingAndSendEmail(bookingId: string, paymentMethodName: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      tickets: {
        include: {
          seat: true,
          showtime: {
            include: {
              movie: true,
              room: {
                include: {
                  cinema: true
                }
              }
            }
          }
        }
      },
      foodItems: {
        include: {
          food: true
        }
      }
    }
  });

  if (!booking) return null;

  // Nếu đơn hàng đã PAID thì không cần gửi lại để tránh spam
  if (booking.paymentStatus === 'PAID' && booking.ticketCode && booking.qrCodeUrl) {
    return booking;
  }

  const ticketCode = booking.ticketCode || `GLX-${Math.floor(100000 + Math.random() * 900000)}`;
  const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify({ bookingId: booking.id, ticketCode }));

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentMethod: paymentMethodName,
      ticketCode,
      qrCodeUrl: qrCodeDataUrl
    },
    include: {
      user: true,
      tickets: {
        include: {
          seat: true,
          showtime: {
            include: {
              movie: true,
              room: {
                include: {
                  cinema: true
                }
              }
            }
          }
        }
      },
      foodItems: {
        include: {
          food: true
        }
      }
    }
  });

  // Tích điểm thưởng cho thành viên (10.000 VNĐ = 1 điểm)
  const pointsEarned = Math.floor(booking.total / 10000);
  if (pointsEarned > 0 && booking.userId) {
    await prisma.user.update({
      where: { id: booking.userId },
      data: {
        rewardPoints: { increment: pointsEarned }
      }
    });
  }

  // Tự động kích hoạt SMTP gửi E-Ticket kèm QR Code đến email khách hàng
  if (booking.user && booking.user.email) {
    const firstTicket = updatedBooking.tickets && updatedBooking.tickets.length > 0 ? updatedBooking.tickets[0] : null;
    const movieTitle = firstTicket?.showtime?.movie?.title || 'Phim Điện Ảnh';
    const cinemaName = firstTicket?.showtime?.room?.cinema?.name || 'Aeon Cine';
    const roomName = firstTicket?.showtime?.room?.name || 'Phòng chiếu';
    const startTime = firstTicket?.showtime?.startTime 
      ? new Date(firstTicket.showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
      : 'Suất chiếu đã chọn';
    const seatsStr = updatedBooking.tickets.map(t => t.seat.name).join(', ') || 'Ghế đã chọn';
    const foodStr = updatedBooking.foodItems && updatedBooking.foodItems.length > 0 
      ? updatedBooking.foodItems.map(f => `${f.quantity}x ${f.food.name}`).join(', ') 
      : undefined;

    sendTicketEmail({
      toEmail: booking.user.email,
      userName: booking.user.name,
      ticketCode,
      movieTitle,
      cinemaName,
      roomName,
      showtime: startTime,
      seats: seatsStr,
      foodItems: foodStr,
      paymentMethod: paymentMethodName,
      total: booking.total,
      qrCodeDataUrl
    }).catch(err => console.error('[EMAIL SENDING ERROR]:', err));
  }

  return updatedBooking;
}

/**
 * Xác nhận thanh toán thông thường (VNPay / MoMo / Cash)
 */
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    const updatedBooking = await completeBookingAndSendEmail(bookingId, paymentMethod || 'VNPAY');

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    res.json({
      message: 'Thanh toán thành công và đã xuất vé',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error confirming payment', error });
  }
};

/**
 * Xác nhận thanh toán qua Stripe sau khi chuyển hướng thành công về Frontend
 */
export const confirmStripePayment = async (req: Request, res: Response) => {
  try {
    const { sessionId, bookingId } = req.body;

    if (!sessionId || !bookingId) {
      return res.status(400).json({ message: 'Thiếu thông tin sessionId hoặc bookingId' });
    }

    // Kiểm tra trực tiếp với Stripe API
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Giao dịch Stripe chưa hoàn tất thanh toán' });
    }

    const updatedBooking = await completeBookingAndSendEmail(bookingId, 'STRIPE');

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng tương ứng' });
    }

    res.json({
      message: 'Thanh toán Stripe quốc tế thành công và đã gửi email vé điện tử',
      booking: updatedBooking
    });
  } catch (error: any) {
    console.error('Error confirming Stripe payment:', error);
    res.status(500).json({ message: 'Lỗi xác nhận thanh toán Stripe', error: error?.message || error });
  }
};

/**
 * Webhook tự động của Stripe (checkout.session.completed)
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = (req as any).rawBody || req.body;

  let event: Stripe.Event;

  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } else {
      // Fallback nếu chưa cài signature secret khi test cục bộ
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (err: any) {
    console.error(`⚠️ Stripe Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId || session.client_reference_id;

    if (bookingId) {
      console.log(`[STRIPE WEBHOOK RECEIVED] Xử lý đơn hàng: ${bookingId}`);
      await completeBookingAndSendEmail(bookingId, 'STRIPE');
    }
  }

  res.json({ received: true });
};
