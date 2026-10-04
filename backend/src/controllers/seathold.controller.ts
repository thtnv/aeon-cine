import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const holdSeats = async (req: Request, res: Response) => {
  try {
    const { showtimeId, seatIds, userId } = req.body;

    // Check if any seat is already booked in a completed booking
    const existingTickets = await prisma.ticket.findMany({
      where: {
        showtimeId,
        seatId: { in: seatIds },
        booking: { status: 'COMPLETED' }
      }
    });

    if (existingTickets.length > 0) {
      return res.status(400).json({ message: 'Có ghế đã được người khác đặt thành công!' });
    }

    // Check existing active seat holds by other users
    const now = new Date();
    const activeHolds = await prisma.seatHold.findMany({
      where: {
        showtimeId,
        seatId: { in: seatIds },
        expiresAt: { gt: now },
        userId: { not: userId }
      }
    });

    if (activeHolds.length > 0) {
      return res.status(400).json({ message: 'Một số ghế đang được người khác giữ. Vui lòng chọn ghế khác!' });
    }

    // Clear old holds for this user & showtime
    await prisma.seatHold.deleteMany({
      where: { showtimeId, userId }
    });

    // Create new seat holds valid for 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const holdData = seatIds.map((seatId: string) => ({
      showtimeId,
      seatId,
      userId,
      expiresAt
    }));

    await prisma.seatHold.createMany({ data: holdData });

    res.json({
      message: 'Giữ ghế thành công trong 5 phút',
      expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Error holding seats', error });
  }
};

export const getHeldSeats = async (req: Request, res: Response) => {
  try {
    const { showtimeId } = req.params;
    const now = new Date();

    // Remove expired holds
    await prisma.seatHold.deleteMany({
      where: { expiresAt: { lte: now } }
    });

    const activeHolds = await prisma.seatHold.findMany({
      where: { showtimeId: String(showtimeId), expiresAt: { gt: now } },
      select: { seatId: true, userId: true, expiresAt: true }
    });

    res.json(activeHolds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching held seats', error });
  }
};
