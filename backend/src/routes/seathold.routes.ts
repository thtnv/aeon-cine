import { Router } from 'express';
import { holdSeats, getHeldSeats } from '../controllers/seathold.controller';

const router = Router();

router.post('/hold', holdSeats);
router.get('/:showtimeId', getHeldSeats);

export default router;
