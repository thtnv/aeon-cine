import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const applyVoucher = async (req: Request, res: Response) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: String(code).toUpperCase().trim() }
    });

    if (!voucher || voucher.status !== 'ACTIVE') {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' });
    }

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      return res.status(400).json({ message: 'Mã giảm giá không nằm trong thời gian áp dụng' });
    }

    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
    }

    if (orderTotal < voucher.minOrderValue) {
      return res.status(400).json({ 
        message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này` 
      });
    }

    let discountAmount = 0;
    if (voucher.discountType === 'PERCENTAGE') {
      discountAmount = (orderTotal * voucher.discountValue) / 100;
    } else {
      discountAmount = voucher.discountValue;
    }

    discountAmount = Math.min(discountAmount, orderTotal);

    res.json({
      voucherCode: voucher.code,
      discountAmount,
      finalTotal: orderTotal - discountAmount,
      message: 'Áp dụng mã giảm giá thành công'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error applying voucher', error });
  }
};

export const getAllVouchers = async (req: Request, res: Response) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vouchers', error });
  }
};

export const createVoucher = async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderValue, startDate, endDate, usageLimit } = req.body;
    const voucher = await prisma.voucher.create({
      data: {
        code: String(code).toUpperCase().trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue || 0),
        startDate: new Date(startDate || Date.now()),
        endDate: new Date(endDate || (Date.now() + 365 * 24 * 60 * 60 * 1000)),
        usageLimit: Number(usageLimit || 0)
      }
    });
    res.status(201).json(voucher);
  } catch (error) {
    res.status(500).json({ message: 'Error creating voucher', error });
  }
};

export const updateVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, minOrderValue, startDate, endDate, usageLimit, status } = req.body;

    const data: any = {};
    if (code) data.code = String(code).toUpperCase().trim();
    if (discountType) data.discountType = discountType;
    if (discountValue !== undefined) data.discountValue = Number(discountValue);
    if (minOrderValue !== undefined) data.minOrderValue = Number(minOrderValue);
    if (startDate) data.startDate = new Date(startDate);
    if (endDate) data.endDate = new Date(endDate);
    if (usageLimit !== undefined) data.usageLimit = Number(usageLimit);
    if (status) data.status = status;

    const updated = await prisma.voucher.update({
      where: { id: String(id) },
      data
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating voucher', error });
  }
};

export const deleteVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.voucher.delete({
      where: { id: String(id) }
    });
    res.json({ message: 'Voucher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting voucher', error });
  }
};
