import { Router } from 'express';
import { createBooking, getUserBookings, getBookingStats, getAllBookings } from '../controllers/booking.controller';

const router = Router();

router.get('/', getAllBookings as any);
router.get('/stats/analytics', getBookingStats as any);
router.post('/', createBooking as any);
router.get('/user/:userId', getUserBookings as any);

export default router;

