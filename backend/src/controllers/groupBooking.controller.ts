import { Request, Response } from 'express';
import prisma from '../prismaClient';

// Tạo yêu cầu đặt vé đoàn / thuê rạp mới
export const createGroupBooking = async (req: Request, res: Response) => {
  try {
    const {
      contactName,
      phone,
      email,
      companyName,
      cinemaId,
      cinemaName,
      serviceType,
      expectedGuests,
      expectedDate,
      notes
    } = req.body;

    if (!contactName || !phone || !email || !serviceType) {
      return res.status(400).json({
        message: 'Vui lòng cung cấp đầy đủ thông tin: Họ tên, Số điện thoại, Email và Loại dịch vụ quan tâm.'
      });
    }

    let validCinemaId: string | null = null;
    let resolvedCinemaName = cinemaName ? cinemaName.trim() : null;
    if (cinemaId) {
      const c = await prisma.cinema.findUnique({ where: { id: String(cinemaId) } });
      if (c) {
        validCinemaId = c.id;
        if (!resolvedCinemaName) resolvedCinemaName = c.name;
      }
    } else if (resolvedCinemaName) {
      const c = await prisma.cinema.findFirst({ where: { name: { contains: resolvedCinemaName, mode: 'insensitive' } } });
      if (c) validCinemaId = c.id;
    }

    const newRequest = await prisma.groupBooking.create({
      data: {
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        companyName: companyName ? companyName.trim() : null,
        cinemaId: validCinemaId,
        serviceType: serviceType || 'GROUP_TICKET',
        expectedGuests: Number(expectedGuests) || 20,
        expectedDate: expectedDate || null,
        notes: notes ? notes.trim() : null,
        status: 'PENDING'
      },
      include: {
        cinema: true
      }
    });

    const refCode = `GB-${newRequest.id.slice(0, 8).toUpperCase()}`;

    res.status(201).json({
      success: true,
      refCode,
      message: `Gửi yêu cầu thành công! Mã hồ sơ của bạn là ${refCode}. Chuyên viên dịch vụ doanh nghiệp AEON CINE sẽ liên hệ bạn trong vòng 2 giờ làm việc.`,
      data: {
        ...newRequest,
        cinemaName: newRequest.cinema?.name || resolvedCinemaName || null
      }
    });
  } catch (error: any) {
    console.error('Error creating group booking:', error);
    res.status(500).json({ message: 'Lỗi khi tạo yêu cầu đặt vé đoàn', error: error?.message || error });
  }
};

// Lấy danh sách yêu cầu đặt vé đoàn (Admin)
export const getAllGroupBookings = async (req: Request, res: Response) => {
  try {
    const list = await prisma.groupBooking.findMany({
      include: { cinema: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(list.map(item => ({
      ...item,
      cinemaName: item.cinema?.name || 'Chưa chọn rạp cụ thể'
    })));
  } catch (error: any) {
    console.error('Error fetching group bookings:', error);
    res.status(500).json({ message: 'Lỗi khi tải danh sách đặt vé đoàn', error });
  }
};

// Cập nhật trạng thái yêu cầu đặt vé đoàn (Admin)
export const updateGroupBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updated = await prisma.groupBooking.update({
      where: { id: String(id) },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {})
      },
      include: { cinema: true }
    });

    res.json({
      success: true,
      data: {
        ...updated,
        cinemaName: updated.cinema?.name || 'Chưa chọn rạp cụ thể'
      }
    });
  } catch (error: any) {
    console.error('Error updating group booking:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật yêu cầu đặt vé đoàn', error });
  }
};
