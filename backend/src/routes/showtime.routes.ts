import { Router } from 'express';
import {
  getShowtimesByMovie,
  createShowtime,
  getAllShowtimes,
  updateShowtime,
  deleteShowtime,
  getOccupiedSeats
} from '../controllers/showtime.controller';

const router = Router();

router.get('/', getAllShowtimes as any);
router.get('/movie/:movieId', getShowtimesByMovie as any);
router.get('/:id/occupied-seats', getOccupiedSeats as any);
router.post('/', createShowtime as any);
router.put('/:id', updateShowtime as any);
router.delete('/:id', deleteShowtime as any);

export default router;
