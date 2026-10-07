import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { apiCache } from '../utils/cache';

export const getCinemas = async (req: Request, res: Response) => {
  try {
    const bypassCache = req.query._t || req.headers['cache-control']?.includes('no-cache');
    if (!bypassCache) {
      const cached = apiCache.get('all_cinemas');
      if (cached) {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        return res.json(cached);
      }
    }

    const cinemas = await prisma.cinema.findMany({
      include: {
        rooms: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Chuẩn hóa dữ liệu trả về (đảm bảo address fallback vào location và amenities luôn là mảng)
    const formatted = cinemas.map(c => ({
      ...c,
      address: c.address || c.location,
      amenities: Array.isArray(c.amenities) ? c.amenities : []
    }));

    apiCache.set('all_cinemas', formatted, 60);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cinemas' });
  }
};

export const createCinema = async (req: Request, res: Response) => {
  try {
    const { name, location, address, city, phone, mapUrl, directionsUrl, amenities } = req.body;
    const finalAddress = address || location;
    const finalLocation = location || address;

    if (!name || !finalLocation) {
      return res.status(400).json({ error: 'Tên và địa chỉ rạp là bắt buộc' });
    }

    // Xử lý amenities: nếu gửi chuỗi phân tách bởi dấu phẩy thì chuyển thành mảng
    let parsedAmenities: string[] = [];
    if (Array.isArray(amenities)) {
      parsedAmenities = amenities.map((s: any) => String(s).trim()).filter(Boolean);
    } else if (typeof amenities === 'string') {
      parsedAmenities = amenities.split(',').map(s => s.trim()).filter(Boolean);
    }

    const cinema = await prisma.cinema.create({
      data: {
        name,
        location: finalLocation,
        address: finalAddress,
        city: city || 'TP.HCM',
        phone: phone || null,
        mapUrl: mapUrl || null,
        directionsUrl: directionsUrl || null,
        amenities: parsedAmenities
      },
      include: { rooms: true }
    });
    apiCache.del('all_cinemas');
    res.status(201).json(cinema);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cinema' });
  }
};

export const updateCinema = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, address, city, phone, mapUrl, directionsUrl, amenities } = req.body;
    const finalAddress = address !== undefined ? address : (location !== undefined ? location : undefined);
    const finalLocation = location !== undefined ? location : (address !== undefined ? address : undefined);

    let parsedAmenities: string[] | undefined = undefined;
    if (amenities !== undefined) {
      if (Array.isArray(amenities)) {
        parsedAmenities = amenities.map((s: any) => String(s).trim()).filter(Boolean);
      } else if (typeof amenities === 'string') {
        parsedAmenities = amenities.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (finalLocation !== undefined) updateData.location = finalLocation;
    if (finalAddress !== undefined) updateData.address = finalAddress;
    if (city !== undefined) updateData.city = city;
    if (phone !== undefined) updateData.phone = phone;
    if (mapUrl !== undefined) updateData.mapUrl = mapUrl;
    if (directionsUrl !== undefined) updateData.directionsUrl = directionsUrl;
    if (parsedAmenities !== undefined) updateData.amenities = parsedAmenities;

    const cinema = await prisma.cinema.update({
      where: { id: String(id) },
      data: updateData
    });
    apiCache.del('all_cinemas');
    res.json(cinema);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cinema' });
  }
};

export const deleteCinema = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cinemaId = String(id);

    const cinema = await prisma.cinema.findUnique({
      where: { id: cinemaId },
      include: {
        rooms: {
          select: { id: true }
        }
      }
    });

    if (!cinema) {
      return res.status(404).json({ error: 'Không tìm thấy cụm rạp cần xóa' });
    }

    const roomIds = cinema.rooms.map(r => r.id);

    if (roomIds.length > 0) {
      // 1. Find all showtimes for these rooms
      const showtimes = await prisma.showtime.findMany({
        where: { roomId: { in: roomIds } },
        select: { id: true }
      });
      const showtimeIds = showtimes.map(s => s.id);

      if (showtimeIds.length > 0) {
        // Delete seat holds
        await prisma.seatHold.deleteMany({
          where: { showtimeId: { in: showtimeIds } }
        });
        // Delete tickets
        await prisma.ticket.deleteMany({
          where: { showtimeId: { in: showtimeIds } }
        });
        // Delete showtimes
        await prisma.showtime.deleteMany({
          where: { id: { in: showtimeIds } }
        });
      }

      // Delete seats for these rooms
      await prisma.seat.deleteMany({
        where: { roomId: { in: roomIds } }
      });

      // Delete rooms
      await prisma.room.deleteMany({
        where: { id: { in: roomIds } }
      });
    }

    // Delete cinema
    await prisma.cinema.delete({
      where: { id: cinemaId }
    });
    apiCache.del('all_cinemas');

    // Sync to aeon_cinema_db_vi if available
    try {
      const { Client } = require('pg');
      const clientVi = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi' });
      await clientVi.connect();
      await clientVi.query('DELETE FROM "CumRap" WHERE "maRap" = $1', [cinemaId]);
      await clientVi.end();
    } catch (viErr: any) {
      console.warn('Could not sync cinema deletion to VI db:', viErr.message);
    }

    res.json({ message: 'Xóa cụm rạp thành công', id: cinemaId, name: cinema.name });
  } catch (error) {
    console.error('Failed to delete cinema:', error);
    res.status(500).json({ error: 'Failed to delete cinema', details: error });
  }
};

export const createRoomForCinema = async (req: Request, res: Response) => {
  try {
    const { cinemaId } = req.params;
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Tên phòng chiếu là bắt buộc' });
    }

    const room = await prisma.room.create({
      data: {
        name: String(name).trim(),
        cinemaId: String(cinemaId)
      }
    });

    // Tự động tạo 80 ghế chuẩn A1-H10 (H: SWEETBOX, C-G: VIP, A-B: STANDARD)
    const allSeatTypes = await prisma.seatType.findMany();
    const standardType = allSeatTypes.find(t => t.code === 'STANDARD');
    const vipType = allSeatTypes.find(t => t.code === 'VIP');
    const sweetboxType = allSeatTypes.find(t => t.code === 'SWEETBOX');

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsToCreate = [];
    for (const row of rows) {
      let targetTypeId = standardType?.id || allSeatTypes[0]?.id;
      if (row === 'H' && sweetboxType) targetTypeId = sweetboxType.id;
      else if (['C', 'D', 'E', 'F', 'G'].includes(row) && vipType) targetTypeId = vipType.id;

      for (let num = 1; num <= 10; num++) {
        seatsToCreate.push({
          name: `${row}${num}`,
          typeId: targetTypeId,
          roomId: room.id
        });
      }
    }
    await prisma.seat.createMany({ data: seatsToCreate });
    apiCache.del('all_cinemas');

    res.status(201).json(room);
  } catch (error) {
    console.error('Failed to create room:', error);
    res.status(500).json({ error: 'Lỗi khi tạo phòng chiếu mới' });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Tên phòng chiếu là bắt buộc' });
    }

    const room = await prisma.room.update({
      where: { id: String(roomId) },
      data: { name: String(name).trim() }
    });
    apiCache.del('all_cinemas');

    res.json(room);
  } catch (error) {
    console.error('Failed to update room:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật phòng chiếu' });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { force } = req.query;

    // Kiểm tra nếu phòng đã bị xóa trước đó thì trả về thành công luôn (Idempotent)
    const existing = await prisma.room.findUnique({
      where: { id: String(roomId) },
      select: { id: true }
    });

    if (!existing) {
      apiCache.del('all_cinemas');
      apiCache.clearPattern('showtimes_');
      return res.json({ message: 'Phòng chiếu đã được xóa thành công', id: roomId });
    }

    const showtimeCount = await prisma.showtime.count({
      where: { roomId: String(roomId) }
    });

    if (showtimeCount > 0 && force !== 'true') {
      return res.status(400).json({
        error: `Không thể xóa phòng chiếu này vì đang có ${showtimeCount} suất chiếu liên kết!`,
        showtimeCount
      });
    }

    // Nếu force === 'true', tự động dọn sạch các suất chiếu và ghế liên quan
    if (showtimeCount > 0 && force === 'true') {
      const showtimes = await prisma.showtime.findMany({
        where: { roomId: String(roomId) },
        select: { id: true }
      });
      const stIds = showtimes.map(s => s.id);

      await prisma.seatHold.deleteMany({
        where: { showtimeId: { in: stIds } }
      });
      await prisma.ticket.deleteMany({
        where: { showtimeId: { in: stIds } }
      });
      await prisma.showtime.deleteMany({
        where: { roomId: String(roomId) }
      });

      apiCache.clearPattern('showtimes_');
    }

    // Xóa ghế và xóa phòng
    await prisma.seat.deleteMany({ where: { roomId: String(roomId) } });
    try {
      await prisma.room.delete({ where: { id: String(roomId) } });
    } catch (delErr: any) {
      if (delErr.code !== 'P2025') {
        throw delErr;
      }
    }
    apiCache.del('all_cinemas');

    res.json({ message: 'Đã xóa phòng chiếu thành công', id: roomId });
  } catch (error) {
    console.error('Failed to delete room:', error);
    res.status(500).json({ error: 'Lỗi khi xóa phòng chiếu' });
  }
};


