import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { apiCache } from '../utils/cache';

export const getPrices = async (req: Request, res: Response) => {
  try {
    const cached = apiCache.get('all_prices');
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      return res.json(cached);
    }

    const prices = await prisma.priceConfig.findMany({
      include: {
        seatType: true,
        screenFormat: true
      },
      orderBy: [
        { isWeekend: 'asc' }
      ]
    });

    const result = prices.map(p => ({
      id: p.id,
      seatTypeId: p.seatTypeId,
      seatType: p.seatType?.code || 'STANDARD',
      formatId: p.formatId,
      format: p.screenFormat?.code || '2D',
      isWeekend: p.isWeekend,
      price: p.price,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    apiCache.set('all_prices', result, 600);
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.json(result);
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ message: 'Error fetching price configuration', error });
  }
};

export const updatePrices = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const itemsToUpdate: Array<{ seatType: 'STANDARD' | 'VIP' | 'SWEETBOX'; format: string; isWeekend: boolean; price: number }> = [];

    if (Array.isArray(body)) {
      for (const item of body) {
        if (item.seatType && item.price !== undefined) {
          itemsToUpdate.push({
            seatType: item.seatType,
            format: item.format || '2D',
            isWeekend: Boolean(item.isWeekend),
            price: Number(item.price)
          });
        }
      }
    } else if (body && typeof body === 'object') {
      // Support object format from PriceMatrixManager
      const stdWd = Number(body.stdWeekday || 75000);
      const stdWe = Number(body.stdWeekend || 95000);
      const vipWd = Number(body.vipWeekday || 95000);
      const vipWe = Number(body.vipWeekend || 110000);
      const swtWd = Number(body.sweetboxWeekday || 180000);
      const swtWe = Number(body.sweetboxWeekend || 210000);
      const sur3D = Number(body.surcharge3D || 20000);

      itemsToUpdate.push(
        { seatType: 'STANDARD', format: '2D', isWeekend: false, price: stdWd },
        { seatType: 'STANDARD', format: '2D', isWeekend: true, price: stdWe },
        { seatType: 'VIP', format: '2D', isWeekend: false, price: vipWd },
        { seatType: 'VIP', format: '2D', isWeekend: true, price: vipWe },
        { seatType: 'SWEETBOX', format: '2D', isWeekend: false, price: swtWd },
        { seatType: 'SWEETBOX', format: '2D', isWeekend: true, price: swtWe },
        { seatType: 'STANDARD', format: '3D', isWeekend: false, price: stdWd + sur3D },
        { seatType: 'STANDARD', format: '3D', isWeekend: true, price: stdWe + sur3D },
        { seatType: 'VIP', format: '3D', isWeekend: false, price: vipWd + sur3D },
        { seatType: 'VIP', format: '3D', isWeekend: true, price: vipWe + sur3D }
      );
    }

    const allSeatTypes = await prisma.seatType.findMany();
    const allFormats = await prisma.screenFormat.findMany();
    const seatTypeMap = new Map(allSeatTypes.map(st => [st.code, st.id]));
    const formatMap = new Map(allFormats.map(sf => [sf.code, sf.id]));

    const updatedResults = [];
    for (const item of itemsToUpdate) {
      const seatTypeId = seatTypeMap.get(item.seatType) || allSeatTypes[0]?.id;
      const formatId = formatMap.get(item.format) || allFormats[0]?.id;

      const existing = await prisma.priceConfig.findFirst({
        where: {
          seatTypeId,
          formatId,
          isWeekend: item.isWeekend
        }
      });

      if (existing) {
        const u = await prisma.priceConfig.update({
          where: { id: existing.id },
          data: { price: item.price }
        });
        updatedResults.push(u);
      } else {
        const c = await prisma.priceConfig.create({
          data: {
            seatTypeId,
            formatId,
            isWeekend: item.isWeekend,
            price: item.price
          }
        });
        updatedResults.push(c);
      }
    }

    // Sync to aeon_cinema_db_vi
    try {
      const { Client } = require('pg');
      const clientVi = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi' });
      await clientVi.connect();
      for (const item of itemsToUpdate) {
        await clientVi.query(`
          UPDATE "BangGiaVe"
          SET "giaVe" = $1, "ngayCapNhat" = NOW()
          WHERE "maLoaiGhe" = $2 AND "maDinhDang" = $3 AND "laCuoiTuan" = $4
        `, [item.price, item.seatType, item.format, item.isWeekend]);
      }
      await clientVi.end();
    } catch (viErr: any) {
      console.warn('Could not sync prices to VI db:', viErr.message);
    }

    apiCache.del('all_prices');
    res.json({ message: 'Cập nhật bảng giá vé thành công!', count: updatedResults.length });
  } catch (error) {
    console.error('Error updating prices:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật giá vé', error });
  }
};
