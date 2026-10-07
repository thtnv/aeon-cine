import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const holdSeats = async (req: Request, res: Response) => {
  try {
    const { showtimeId, seatIds, userId } = req.body;

    if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ message: 'Thông tin giữ ghế không hợp lệ' });
    }

    // Resolve showtime and its room's seats
    const st = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: { room: { include: { seats: true } } }
    });

    // Resolve seat UUIDs from seat names or existing IDs
    const resolvedSeatIds: string[] = [];
    if (st && st.room && st.room.seats) {
      for (const sId of seatIds) {
        const found = st.room.seats.find(s => s.name.toUpperCase() === String(sId).toUpperCase() || s.id === sId);
        if (found) {
          resolvedSeatIds.push(found.id);
        } else {
          // If seat does not exist in room yet, create it
          const row = String(sId).charAt(0).toUpperCase();
          let seatType: any = 'STANDARD';
          if (row === 'H') seatType = 'SWEETBOX';
          else if (['C', 'D', 'E', 'F'].includes(row)) seatType = 'VIP';
          const newSeat = await prisma.seat.create({
            data: {
              name: String(sId).toUpperCase(),
              type: seatType,
              roomId: st.roomId
            }
          });
          resolvedSeatIds.push(newSeat.id);
        }
      }
    } else {
      resolvedSeatIds.push(...seatIds);
    }

    // Validate User ID
    let validUserId: string | null = null;
    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: String(userId) } });
      if (userExists) validUserId = userExists.id;
    }

    // Check if any seat is already booked in a completed booking
    const existingTickets = await prisma.ticket.findMany({
      where: {
        showtimeId,
        seatId: { in: resolvedSeatIds },
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
        seatId: { in: resolvedSeatIds },
        expiresAt: { gt: now },
        ...(validUserId ? { userId: { not: validUserId } } : {})
      }
    });

    if (activeHolds.length > 0) {
      return res.status(400).json({ message: 'Một số ghế đang được người khác giữ. Vui lòng chọn ghế khác!' });
    }

    // Clear old holds for this user & showtime
    if (validUserId) {
      await prisma.seatHold.deleteMany({
        where: { showtimeId, userId: validUserId }
      });
    }

    // Create new seat holds valid for 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const holdData = resolvedSeatIds.map((sId: string) => ({
      showtimeId,
      seatId: sId,
      userId: validUserId,
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
      include: { seat: true }
    });

    res.json(activeHolds.map(h => ({
      seatId: h.seat?.name || h.seatId,
      realSeatId: h.seatId,
      userId: h.userId,
      expiresAt: h.expiresAt
    })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching held seats', error });
  }
};
