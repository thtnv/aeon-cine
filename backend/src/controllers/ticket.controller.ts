import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const verifyTicket = async (req: Request, res: Response) => {
  try {
    const { ticketCode } = req.body;

    if (!ticketCode) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã vé hoặc quét mã QR' });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { ticketCode: String(ticketCode).trim() },
          { id: String(ticketCode).trim() }
        ]
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        tickets: {
          include: {
            showtime: { include: { movie: true, room: { include: { cinema: true } } } },
            seat: true
          }
        },
        foodItems: { include: { food: true } }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Mã vé không tồn tại trên hệ thống!' });
    }

    if (booking.status !== 'COMPLETED' || booking.paymentStatus !== 'PAID') {
      return res.status(400).json({ message: 'Vé chưa được thanh toán thành công!' });
    }

    res.json({
      valid: true,
      message: 'Xác thực vé hợp lệ! Khách hàng có thể vào xem phim.',
      bookingDetails: {
        ticketCode: booking.ticketCode,
        customerName: booking.user.name,
        customerEmail: booking.user.email,
        movieTitle: booking.tickets[0]?.showtime.movie.title,
        cinemaName: booking.tickets[0]?.showtime.room.cinema.name,
        roomName: booking.tickets[0]?.showtime.room.name,
        startTime: booking.tickets[0]?.showtime.startTime,
        seats: booking.tickets.map(t => t.seat.name),
        foods: booking.foodItems.map(f => `${f.food.name} (x${f.quantity})`)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying ticket', error });
  }
};
