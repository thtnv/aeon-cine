import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { apiCache } from '../utils/cache';

export const getPromotions = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const catKey = (category && typeof category === 'string') ? category.toUpperCase() : 'ALL';
    const cacheKey = `promotions_${catKey}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
      return res.json(cached);
    }

    const where: any = {};
    if (category && typeof category === 'string' && category !== 'ALL') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    const promotions = await prisma.promotion.findMany({
      where,
      include: {
        vouchers: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
            minOrderValue: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    apiCache.set(cacheKey, promotions, 180);
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    res.json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ message: 'Error fetching promotions', error });
  }
};

export const getPromotionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promotion = await prisma.promotion.findUnique({
      where: { id: String(id) },
      include: {
        vouchers: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
            minOrderValue: true,
            status: true
          }
        }
      }
    });
    if (!promotion) {
      return res.status(404).json({ message: 'Không tìm thấy ưu đãi' });
    }
    res.json(promotion);
  } catch (error) {
    console.error('Error fetching promotion details:', error);
    res.status(500).json({ message: 'Error fetching promotion details', error });
  }
};

export const createPromotion = async (req: Request, res: Response) => {
  try {
    const { title, desc, category, badge, validUntil, terms, coverUrl, status, voucherCode } = req.body;
    if (!title || !desc || !category || !validUntil || !terms) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (tiêu đề, mô tả, danh mục, hạn dùng, thể lệ)' });
    }

    const newPromotion = await prisma.promotion.create({
      data: {
        title,
        desc,
        category,
        badge: badge || null,
        validUntil,
        terms,
        coverUrl: coverUrl || null,
        status: status || 'ACTIVE'
      }
    });

    if (voucherCode && typeof voucherCode === 'string') {
      await prisma.voucher.updateMany({
        where: { code: voucherCode.trim().toUpperCase() },
        data: { promotionId: newPromotion.id }
      });
    }

    apiCache.clearPattern('promotions_');
    res.status(201).json(newPromotion);
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ message: 'Error creating promotion', error });
  }
};

export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, desc, category, badge, validUntil, terms, coverUrl, status, voucherCode } = req.body;

    const updated = await prisma.promotion.update({
      where: { id: String(id) },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(desc !== undefined ? { desc } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(badge !== undefined ? { badge } : {}),
        ...(validUntil !== undefined ? { validUntil } : {}),
        ...(terms !== undefined ? { terms } : {}),
        ...(coverUrl !== undefined ? { coverUrl } : {}),
        ...(status !== undefined ? { status } : {})
      }
    });

    if (voucherCode !== undefined) {
      if (voucherCode && typeof voucherCode === 'string') {
        await prisma.voucher.updateMany({
          where: { code: voucherCode.trim().toUpperCase() },
          data: { promotionId: String(id) }
        });
      }
    }

    apiCache.clearPattern('promotions_');
    res.json(updated);
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ message: 'Error updating promotion', error });
  }
};

export const deletePromotion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.promotion.delete({
      where: { id: String(id) }
    });
    apiCache.clearPattern('promotions_');
    res.json({ message: 'Xóa ưu đãi thành công' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ message: 'Error deleting promotion', error });
  }
};
