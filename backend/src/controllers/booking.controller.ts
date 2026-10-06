import { Request, Response } from 'express';
import QRCode from 'qrcode';
import prisma from '../prismaClient';

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { 
      userId, 
      showtimeId, 
      seatIds, 
      foodItems, 
      voucherCode, 
      discountAmount, 
      pointsUsed,
      paymentMethod, 
      total 
    } = req.body;

    // 1. Resolve Valid User ID & Kiểm soát nội bộ (Chỉ USER mới được phép đặt vé)
    let validUserId = userId;
    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (userExists) {
        if (userExists.role !== 'USER') {
          return res.status(403).json({
            message: `Tài khoản nội bộ (${userExists.role}) không được phép đặt vé xem phim B2C nhằm tuân thủ quy định kiểm soát nội bộ rạp chiếu và chống xung đột lợi ích. Chỉ tài khoản Khách hàng (USER) mới có quyền đặt vé.`
          });
        }
        validUserId = userExists.id;
      } else {
        const fallbackUser = await prisma.user.findFirst();
        if (fallbackUser) validUserId = fallbackUser.id;
      }
    } else {
      const fallbackUser = await prisma.user.findFirst();
      if (fallbackUser) validUserId = fallbackUser.id;
    }

    // 2. Resolve Valid Showtime ID
    let validShowtimeId = showtimeId;
    let st = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: { room: { include: { seats: true } } }
    });

    if (!st) {
      // Nếu showtimeId truyền vào là movieId
      const altSt = await prisma.showtime.findFirst({
        where: { movieId: showtimeId },
        include: { room: { include: { seats: true } } }
      });
      if (altSt) {
        st = altSt;
        validShowtimeId = altSt.id;
      } else {
        st = await prisma.showtime.findFirst({
          include: { room: { include: { seats: true } } }
        });
        if (st) validShowtimeId = st.id;
      }
    }

    const ticketCode = `GLX-${Math.floor(100000 + Math.random() * 900000)}`;

    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId: validUserId,
          status: paymentMethod === 'CASH' ? 'COMPLETED' : 'PENDING',
          paymentStatus: paymentMethod === 'CASH' ? 'PAID' : 'UNPAID',
          paymentMethod: paymentMethod || 'VNPAY',
          voucherCode: voucherCode || null,
          discountAmount: Number(discountAmount || 0),
          ticketCode,
          total: Number(total)
        }
      });

      // Create QR code
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify({
        bookingId: newBooking.id,
        ticketCode: newBooking.ticketCode
      }));

      await tx.booking.update({
        where: { id: newBooking.id },
        data: { qrCodeUrl }
      });

      const ticketsData = await Promise.all(
        seatIds.map(async (sId: string) => {
          let resolvedSeatId = sId;
          if (st && st.room && st.room.seats) {
            const found = st.room.seats.find(s => s.name.toUpperCase() === sId.toUpperCase() || s.id === sId);
            if (found) {
              resolvedSeatId = found.id;
            } else {
              const row = sId.charAt(0);
              let seatType: any = 'STANDARD';
              if (row === 'H') seatType = 'SWEETBOX';
              else if (['C', 'D', 'E', 'F'].includes(row)) seatType = 'VIP';
              const newSeat = await tx.seat.create({
                data: {
                  name: sId.toUpperCase(),
                  type: seatType,
                  roomId: st.roomId
                }
              });
              resolvedSeatId = newSeat.id;
            }
          }

          return {
            bookingId: newBooking.id,
            showtimeId: validShowtimeId,
            seatId: resolvedSeatId,
            price: (total + (discountAmount || 0)) / seatIds.length
          };
        })
      );
      await tx.ticket.createMany({ data: ticketsData });

      // Create Food Items if selected
      if (foodItems && Array.isArray(foodItems) && foodItems.length > 0) {
        const foodData = foodItems.map((f: { foodId: string; quantity: number; price: number }) => ({
          bookingId: newBooking.id,
          foodId: f.foodId,
          quantity: Number(f.quantity),
          price: Number(f.price)
        }));
        await tx.bookingFood.createMany({ data: foodData });
      }

      // If voucher used, increment usage count
      if (voucherCode) {
        await tx.voucher.updateMany({
          where: { code: String(voucherCode).toUpperCase().trim() },
          data: { usedCount: { increment: 1 } }
        });
      }

      // Release seat holds for this user
      await tx.seatHold.deleteMany({
        where: { showtimeId: validShowtimeId, userId: validUserId }
      });

      // Bổ sung tích điểm thành viên (10.000 VNĐ = 1 điểm) và trừ điểm đã đổi
      const earnedPoints = Math.floor(Number(total) / 10000);
      const usedPointsCount = Math.max(0, Number(pointsUsed || 0));

      const user = await tx.user.findUnique({ where: { id: validUserId } });
      if (user) {
        const newTotalPoints = Math.max(0, user.rewardPoints - usedPointsCount) + earnedPoints;
        let newMembershipLevel = user.membershipLevel;
        
        if (newTotalPoints >= 500) {
          newMembershipLevel = 'X-STAR';
        } else if (newTotalPoints >= 100) {
          newMembershipLevel = 'G-STAR';
        } else {
          newMembershipLevel = 'STAR';
        }

        await tx.user.update({
          where: { id: validUserId },
          data: {
            rewardPoints: newTotalPoints,
            membershipLevel: newMembershipLevel
          }
        });
      }

      return newBooking;
    });

    const fullBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        tickets: { include: { showtime: { include: { movie: true, room: { include: { cinema: true } } } }, seat: true } },
        foodItems: { include: { food: true } }
      }
    });

    res.status(201).json(fullBooking);
  } catch (error: any) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking', error: error?.message || error });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        tickets: { 
          include: { 
            showtime: { 
              include: { 
                movie: { select: { id: true, title: true, posterUrl: true } }, 
                room: { include: { cinema: { select: { id: true, name: true } } } } 
              } 
            }, 
            seat: true 
          } 
        },
        foodItems: { include: { food: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all bookings', error });
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const bookings = await prisma.booking.findMany({
      where: { userId: String(userId) },
      include: {
        tickets: { include: { showtime: { include: { movie: true, room: { include: { cinema: true } } } }, seat: true } },
        foodItems: { include: { food: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

export const getBookingStats = async (req: Request, res: Response) => {
  try {
    const totalBookings = await prisma.booking.count();
    const paidBookings = await prisma.booking.count({ where: { paymentStatus: 'PAID' } });
    const unpaidBookings = await prisma.booking.count({ where: { paymentStatus: 'UNPAID' } });

    const totalTickets = await prisma.ticket.count();
    const totalUsers = await prisma.user.count();
    const totalCustomers = await prisma.user.count({ where: { role: 'USER' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });

    const revenueResult = await prisma.booking.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'PAID' }
    });
    const totalRevenue = revenueResult._sum.total || 0;
    const avgOrderValue = paidBookings > 0 ? Math.round(totalRevenue / paidBookings) : 0;

    // Today's revenue & tickets
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const todayRevenueAgg = await prisma.booking.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'PAID', createdAt: { gte: todayStart, lte: todayEnd } }
    });
    const todayRevenue = todayRevenueAgg._sum.total || 0;

    const todayTicketsCount = await prisma.ticket.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd } }
    });

    // Payment methods breakdown (VNPay, Stripe, MoMo)
    const [vnpayAgg, stripeAgg, momoAgg] = await Promise.all([
      prisma.booking.aggregate({
        _count: true,
        _sum: { total: true },
        where: { paymentStatus: 'PAID', paymentMethod: 'VNPAY' }
      }),
      prisma.booking.aggregate({
        _count: true,
        _sum: { total: true },
        where: { paymentStatus: 'PAID', paymentMethod: 'STRIPE' }
      }),
      prisma.booking.aggregate({
        _count: true,
        _sum: { total: true },
        where: { paymentStatus: 'PAID', paymentMethod: 'MOMO' }
      })
    ]);

    // Food Combos breakdown
    const foodStats = await prisma.bookingFood.aggregate({
      _sum: { quantity: true, price: true }
    });
    const totalFoodCount = foodStats._sum.quantity || 0;
    const totalFoodRevenue = foodStats._sum.price || 0;

    // Movie and screen stats
    const [totalMovies, nowShowingMovies, comingSoonMovies, totalShowtimes, totalCinemas] = await Promise.all([
      prisma.movie.count(),
      prisma.movie.count({ where: { status: 'NOW_SHOWING' } }),
      prisma.movie.count({ where: { status: 'COMING_SOON' } }),
      prisma.showtime.count(),
      prisma.cinema.count()
    ]);

    // Ticket type breakdown (Standard vs VIP/Sweetbox)
    const vipTickets = await prisma.ticket.count({
      where: { seat: { type: { in: ['VIP', 'SWEETBOX'] } } }
    });
    const standardTickets = totalTickets - vipTickets;

    // Revenue for the last 7 days
    const last7Days: { date: string; revenue: number; tickets: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayRevenue = await prisma.booking.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      });

      const dayTickets = await prisma.ticket.count({
        where: { createdAt: { gte: startOfDay, lte: endOfDay } }
      });

      const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
      last7Days.push({
        date: dateStr,
        revenue: dayRevenue._sum.total || 0,
        tickets: dayTickets
      });
    }

    // Top movies
    const movies = await prisma.movie.findMany({
      include: {
        showtimes: {
          include: {
            tickets: true
          }
        }
      }
    });

    const topMovies = movies.map(m => {
      let ticketsSold = 0;
      m.showtimes.forEach(st => {
        ticketsSold += st.tickets.length;
      });
      return {
        id: m.id,
        title: m.title,
        posterUrl: m.posterUrl,
        genre: m.genre,
        ticketsSold,
        estimatedRevenue: ticketsSold * 95000
      };
    }).sort((a, b) => b.ticketsSold - a.ticketsSold).slice(0, 4);

    res.json({
      totalRevenue,
      totalTickets,
      totalBookings,
      totalUsers,
      last7Days,
      topMovies,
      details: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          admins: totalAdmins
        },
        orders: {
          total: totalBookings,
          paid: paidBookings,
          unpaid: unpaidBookings,
          vnpay: { count: vnpayAgg._count || 0, amount: vnpayAgg._sum.total || 0 },
          stripe: { count: stripeAgg._count || 0, amount: stripeAgg._sum.total || 0 },
          momo: { count: momoAgg._count || 0, amount: momoAgg._sum.total || 0 }
        },
        tickets: {
          total: totalTickets,
          standard: standardTickets,
          vip: vipTickets,
          today: todayTicketsCount
        },
        movies: {
          total: totalMovies,
          nowShowing: nowShowingMovies,
          comingSoon: comingSoonMovies,
          totalShowtimes,
          totalCinemas
        },
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
          avgOrder: avgOrderValue,
          foodQuantity: totalFoodCount,
          foodRevenue: totalFoodRevenue
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating booking stats', error });
  }
};

export const refundBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id: String(id) },
      include: {
        tickets: {
          include: {
            showtime: { include: { movie: true, room: { include: { cinema: true } } } },
            seat: true
          }
        },
        user: true
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin đơn đặt vé!' });
    }

    if (booking.status === 'CANCELLED' || booking.paymentStatus === 'REFUNDED') {
      return res.status(400).json({ message: 'Đơn đặt vé này đã được hủy/hoàn tiền trước đó.' });
    }

    // 1. Kiểm tra quy định thời gian (Phải trước giờ chiếu tối thiểu 60 phút theo chính sách rạp Galaxy Cinema / CGV)
    if (booking.tickets && booking.tickets.length > 0) {
      const showtime = booking.tickets[0].showtime;
      const showtimeStart = new Date(showtime.startTime).getTime();
      const now = Date.now();
      const diffMinutes = Math.floor((showtimeStart - now) / (1000 * 60));

      if (diffMinutes < 60) {
        return res.status(400).json({
          message: `Theo quy định rạp AEON CINE, vé chỉ được hủy và hoàn tiền trước giờ chiếu tối thiểu 60 phút (Hiện tại chỉ còn ${diffMinutes > 0 ? diffMinutes : 0} phút đến giờ chiếu hoặc suất chiếu đã diễn ra).`
        });
      }
    }

    // 2. Tính số điểm hoàn trả vào Ví Hội Viên (Hoàn 100% giá trị thanh toán, 1.000đ = 1 điểm thưởng)
    const refundPoints = Math.round(Number(booking.total || 0) / 1000);

    const result = await prisma.$transaction(async (tx) => {
      // Cập nhật trạng thái Booking
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'REFUNDED'
        }
      });

      // Hoàn điểm vào tài khoản User
      let updatedUser = null;
      if (booking.userId) {
        const user = await tx.user.findUnique({ where: { id: booking.userId } });
        if (user) {
          const newPoints = user.rewardPoints + refundPoints;
          let newLevel = user.membershipLevel;
          if (newPoints >= 500) newLevel = 'X-STAR';
          else if (newPoints >= 100) newLevel = 'G-STAR';
          else newLevel = 'STAR';

          updatedUser = await tx.user.update({
            where: { id: booking.userId },
            data: {
              rewardPoints: newPoints,
              membershipLevel: newLevel
            }
          });
        }
      }

      return { updatedBooking, updatedUser };
    });

    res.json({
      success: true,
      message: `Hủy vé thành công! Đã hoàn trả 100% giá trị đơn (${Number(booking.total).toLocaleString()}đ) tương đương +${refundPoints} Điểm Thưởng Stars vào tài khoản hội viên của bạn.`,
      booking: result.updatedBooking,
      refundPoints,
      user: result.updatedUser
    });
  } catch (error: any) {
    console.error('Error refunding booking:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý hủy vé và hoàn tiền', error: error?.message || error });
  }
};

