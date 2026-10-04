import { Request, Response } from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';

// Add AuthRequest interface matching auth middleware
export interface AuthRequest extends Request {
  user?: any;
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        bookings: { select: { id: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    const bookingIds = user.bookings.map(b => b.id);
    if (bookingIds.length > 0) {
      // Delete tickets for bookings
      await prisma.ticket.deleteMany({
        where: { bookingId: { in: bookingIds } }
      });
      // Delete food items for bookings
      await prisma.bookingFood.deleteMany({
        where: { bookingId: { in: bookingIds } }
      });
      // Delete bookings
      await prisma.booking.deleteMany({
        where: { id: { in: bookingIds } }
      });
    }

    // Delete reviews
    await prisma.review.deleteMany({
      where: { userId: id }
    });

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    // Sync to aeon_cinema_db_vi if available
    try {
      const { Client } = require('pg');
      const clientVi = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi' });
      await clientVi.connect();
      await clientVi.query('DELETE FROM "NguoiDung" WHERE "maNguoiDung" = $1', [id]);
      await clientVi.end();
    } catch (viErr: any) {
      console.warn('Could not sync user deletion to VI db:', viErr.message);
    }

    res.json({ message: 'Xóa người dùng thành công', id, name: user.name });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    const validRoles = ['USER', 'ADMIN', 'STAFF', 'ACCOUNTANT'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Role không hợp lệ' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        birthDate: true,
        gender: true,
        rewardPoints: true,
        membershipLevel: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile', error });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, phone, birthDate, gender } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phone, birthDate, gender },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        gender: true,
        rewardPoints: true,
        membershipLevel: true,
        createdAt: true,
      }
    });

    res.json({ message: 'Cập nhật thông tin thành công', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật thông tin cá nhân', error });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập mật khẩu cũ và mới' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đổi mật khẩu', error });
  }
};


export const addRewardPoints = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { totalAmount } = req.body;

    if (!totalAmount || typeof totalAmount !== 'number') {
      return res.status(400).json({ message: 'Invalid total amount' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Rule: 10,000 VNĐ = 1 Point
    const earnedPoints = Math.floor(totalAmount / 10000);
    const newTotalPoints = user.rewardPoints + earnedPoints;

    // Membership Level logic: STAR (default), G-STAR (>= 100), X-STAR (>= 500)
    let newMembershipLevel = user.membershipLevel;
    if (newTotalPoints >= 500) {
      newMembershipLevel = 'X-STAR';
    } else if (newTotalPoints >= 100) {
      newMembershipLevel = 'G-STAR';
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        rewardPoints: newTotalPoints,
        membershipLevel: newMembershipLevel
      },
      select: {
        id: true,
        rewardPoints: true,
        membershipLevel: true
      }
    });

    res.json({ message: 'Points added successfully', earnedPoints, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add reward points', error });
  }
};
