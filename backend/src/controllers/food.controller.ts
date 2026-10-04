import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { apiCache } from '../utils/cache';

export const getAllFood = async (req: Request, res: Response) => {
  try {
    const cached = apiCache.get('all_food');
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      return res.json(cached);
    }

    const foodList = await prisma.foodCombo.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });

    apiCache.set('all_food', foodList, 300);
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.json(foodList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching food combos', error });
  }
};

export const createFood = async (req: Request, res: Response) => {
  try {
    const { name, description, price, imageUrl } = req.body;
    const food = await prisma.foodCombo.create({
      data: { name, description, price: Number(price), imageUrl }
    });
    apiCache.del('all_food');
    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: 'Error creating food combo', error });
  }
};

export const updateFood = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, status } = req.body;
    const food = await prisma.foodCombo.update({
      where: { id: String(id) },
      data: { name, description, price: Number(price), imageUrl, status }
    });
    apiCache.del('all_food');
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: 'Error updating food combo', error });
  }
};

export const deleteFood = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const foodId = String(id);

    // 1. Delete associated booking food items first
    await prisma.bookingFood.deleteMany({
      where: { foodId }
    });

    // 2. Delete FoodCombo
    await prisma.foodCombo.delete({
      where: { id: foodId }
    });

    // 3. Sync to aeon_cinema_db_vi if available
    try {
      const { Client } = require('pg');
      const clientVi = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi' });
      await clientVi.connect();
      await clientVi.query('DELETE FROM "ChiTietComboDonHang" WHERE "maCombo" = $1', [foodId]);
      await clientVi.query('DELETE FROM "ComboBapNuoc" WHERE "maCombo" = $1', [foodId]);
      await clientVi.end();
    } catch (viErr: any) {
      console.warn('Could not sync food combo deletion to VI db:', viErr.message);
    }

    apiCache.del('all_food');
    res.json({ message: 'Xóa bắp nước thành công', id: foodId });
  } catch (error) {
    console.error('Error deleting food combo:', error);
    res.status(500).json({ message: 'Error deleting food combo', error });
  }
};
