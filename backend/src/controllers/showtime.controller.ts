import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { apiCache } from '../utils/cache';

export const getShowtimesByMovie = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    const { cinemaId, date } = req.query;

    const cacheKey = `showtimes_movie_${movieId}_${cinemaId || 'all'}_${date || 'all'}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
      return res.json(cached);
    }

    const where: any = { movieId: String(movieId) };

    if (cinemaId) {
      where.room = { cinemaId: String(cinemaId) };
    }

    if (date) {
      const targetDate = new Date(String(date));
      if (!isNaN(targetDate.getTime())) {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.startTime = {
          gte: startOfDay,
          lte: endOfDay
        };
      }
    }

    const showtimes = await prisma.showtime.findMany({
      where,
      select: {
        id: true,
        movieId: true,
        roomId: true,
        formatId: true,
        screenFormat: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        language: true,
        startTime: true,
        endTime: true,
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            duration: true,
            ageRating: true
          }
        },
        room: {
          select: {
            id: true,
            name: true,
            cinemaId: true,
            cinema: {
              select: {
                id: true,
                name: true,
                city: true,
                location: true
              }
            }
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const result = showtimes.map(st => ({
      ...st,
      format: st.screenFormat?.code || '2D'
    }));

    apiCache.set(cacheKey, result, 30);
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching showtimes', error });
  }
};

export const getAllShowtimes = async (req: Request, res: Response) => {
  try {
    const { movieId, cinemaId, date } = req.query;
    const cacheKey = `showtimes_all_${movieId || 'all'}_${cinemaId || 'all'}_${date || 'all'}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');
      return res.json(cached);
    }

    const where: any = {};
    if (movieId) where.movieId = String(movieId);
    if (cinemaId) where.room = { cinemaId: String(cinemaId) };
    if (date) {
      const targetDate = new Date(String(date));
      if (!isNaN(targetDate.getTime())) {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.startTime = {
          gte: startOfDay,
          lte: endOfDay
        };
      }
    }

    const showtimes = await prisma.showtime.findMany({
      where,
      select: {
        id: true,
        movieId: true,
        roomId: true,
        formatId: true,
        screenFormat: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        language: true,
        startTime: true,
        endTime: true,
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            duration: true,
            ageRating: true
          }
        },
        room: {
          select: {
            id: true,
            name: true,
            cinemaId: true,
            cinema: {
              select: {
                id: true,
                name: true,
                city: true
              }
            }
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const result = showtimes.map(st => ({
      ...st,
      format: st.screenFormat?.code || '2D'
    }));

    apiCache.set(cacheKey, result, 15);
    res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all showtimes', error });
  }
};

export const createShowtime = async (req: Request, res: Response) => {
  try {
    const { movieId, roomId, startTime, endTime, format, language } = req.body;
    const formatCode = (format || '2D').toUpperCase();
    const sf = await prisma.screenFormat.findUnique({ where: { code: formatCode } });

    const showtime = await prisma.showtime.create({
      data: {
        movieId,
        roomId,
        formatId: sf?.id || null,
        language: language || 'Phụ đề',
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      },
      include: {
        movie: true,
        room: { include: { cinema: true } },
        screenFormat: true
      }
    });
    apiCache.clearPattern('showtimes_');
    res.status(201).json({
      ...showtime,
      format: showtime.screenFormat?.code || '2D'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating showtime', error });
  }
};

export const updateShowtime = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { movieId, roomId, startTime, endTime, format, language } = req.body;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    const updateData: any = {};
    if (movieId) updateData.movieId = movieId;
    if (roomId) updateData.roomId = roomId;
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (language !== undefined) updateData.language = language;

    if (format !== undefined) {
      const formatCode = String(format).toUpperCase();
      const sf = await prisma.screenFormat.findUnique({ where: { code: formatCode } });
      if (sf) updateData.formatId = sf.id;
    }

    const showtime = await prisma.showtime.update({
      where: { id },
      data: updateData,
      include: {
        movie: true,
        room: { include: { cinema: true } },
        screenFormat: true
      }
    });

    // Đồng bộ sang aeon_cinema_db_vi nếu có
    try {
      const { Client } = require('pg');
      const clientVi = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi' });
      await clientVi.connect();
      const formatVi = showtime.screenFormat?.code || '2D';
      const viFormatRow = (await clientVi.query('SELECT "maDinhDang" FROM "DinhDangChieu" WHERE "maDinhDang" = $1', [formatVi])).rows[0];
      if (viFormatRow) {
        await clientVi.query(
          'UPDATE "LichChieu" SET "maDinhDang" = $1, "ngonNgu" = $2 WHERE "maLichChieu" = $3',
          [viFormatRow.maDinhDang, language || 'Phụ đề', id]
        );
      }
      await clientVi.end();
    } catch (viErr: any) {
      // bỏ qua nếu db phụ không bắt buộc
    }

    apiCache.clearPattern('showtimes_');
    res.json({
      ...showtime,
      format: showtime.screenFormat?.code || '2D'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating showtime', error });
  }
};

export const deleteShowtime = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    // 1. Kiểm tra nếu suất chiếu đã bị xóa trước đó thì trả về thành công luôn (Idempotent)
    const existing = await prisma.showtime.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existing) {
      apiCache.clearPattern('showtimes_');
      return res.json({ message: 'Suất chiếu đã được xóa thành công', id });
    }

    // 2. Delete SeatHolds
    await prisma.seatHold.deleteMany({
      where: { showtimeId: id }
    });

    // 3. Delete Tickets
    await prisma.ticket.deleteMany({
      where: { showtimeId: id }
    });

    // 4. Delete Showtime
    try {
      await prisma.showtime.delete({
        where: { id }
      });
    } catch (delErr: any) {
      if (delErr.code !== 'P2025') {
        throw delErr;
      }
    }

    // 5. Sync to aeon_cinema_db_vi if available
    try {
      const { Client } = require('pg');
      const clientVi = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi' });
      await clientVi.connect();
      await clientVi.query('DELETE FROM "Ve" WHERE "maLichChieu" = $1', [id]);
      await clientVi.query('DELETE FROM "GiuGheTamThoi" WHERE "maLichChieu" = $1', [id]);
      await clientVi.query('DELETE FROM "LichChieu" WHERE "maLichChieu" = $1', [id]);
      await clientVi.end();
    } catch (viErr: any) {
      console.warn('Could not sync showtime deletion to VI db:', viErr.message);
    }

    apiCache.clearPattern('showtimes_');
    res.json({ message: 'Xóa suất chiếu thành công', id });
  } catch (error) {
    console.error('Error deleting showtime:', error);
    res.status(500).json({ message: 'Error deleting showtime', error });
  }
};

export const getOccupiedSeats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const now = new Date();

    // 1. Lấy danh sách ghế từ các vé đã thanh toán thành công
    const bookedTickets = await prisma.ticket.findMany({
      where: {
        showtimeId: String(id),
        booking: {
          status: 'COMPLETED'
        }
      },
      include: { seat: true }
    });

    // 2. Lấy danh sách ghế đang được giữ (chưa hết hạn)
    const activeHolds = await prisma.seatHold.findMany({
      where: {
        showtimeId: String(id),
        expiresAt: { gt: now }
      }
    });

    const occupiedSeatSet = new Set<string>();
    for (const t of bookedTickets) {
      if (t.seat?.name) occupiedSeatSet.add(t.seat.name);
    }
    for (const h of activeHolds) {
      if (h.seatId) occupiedSeatSet.add(h.seatId);
    }

    res.json(Array.from(occupiedSeatSet));
  } catch (error) {
    console.error('Error fetching occupied seats:', error);
    res.status(500).json({ message: 'Error fetching occupied seats', error });
  }
};
