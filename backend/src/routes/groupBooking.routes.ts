import { Router } from 'express';
import { createGroupBooking, getAllGroupBookings, updateGroupBookingStatus } from '../controllers/groupBooking.controller';

const router = Router();

router.post('/', createGroupBooking as any);
router.get('/', getAllGroupBookings as any);
router.patch('/:id/status', updateGroupBookingStatus as any);

export default router;
