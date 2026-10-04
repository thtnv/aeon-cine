import { PrismaClient, SeatType } from '@prisma/client';
import process from 'process';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding price configurations...');

  const priceConfigs = [
    // STANDARD 2D
    { seatType: SeatType.STANDARD, format: '2D', isWeekend: false, price: 75000 },
    { seatType: SeatType.STANDARD, format: '2D', isWeekend: true, price: 95000 },
    
    // VIP 2D
    { seatType: SeatType.VIP, format: '2D', isWeekend: false, price: 95000 },
    { seatType: SeatType.VIP, format: '2D', isWeekend: true, price: 110000 },
    
    // SWEETBOX 2D
    { seatType: SeatType.SWEETBOX, format: '2D', isWeekend: false, price: 180000 },
    { seatType: SeatType.SWEETBOX, format: '2D', isWeekend: true, price: 210000 },

    // STANDARD 3D
    { seatType: SeatType.STANDARD, format: '3D', isWeekend: false, price: 90000 },
    { seatType: SeatType.STANDARD, format: '3D', isWeekend: true, price: 115000 },

    // VIP 3D
    { seatType: SeatType.VIP, format: '3D', isWeekend: false, price: 110000 },
    { seatType: SeatType.VIP, format: '3D', isWeekend: true, price: 130000 },
  ];

  for (const item of priceConfigs) {
    const existing = await prisma.priceConfig.findFirst({
      where: {
        seatType: item.seatType,
        format: item.format,
        isWeekend: item.isWeekend
      }
    });

    if (existing) {
      await prisma.priceConfig.update({
        where: { id: existing.id },
        data: { price: item.price }
      });
    } else {
      await prisma.priceConfig.create({
        data: item
      });
    }
  }

  const count = await prisma.priceConfig.count();
  console.log(`Seeded PriceConfig successfully! Total records: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
