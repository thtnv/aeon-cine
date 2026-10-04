import express from 'express';
import { 
  getCinemas, 
  createCinema, 
  updateCinema, 
  deleteCinema,
  createRoomForCinema,
  updateRoom,
  deleteRoom
} from '../controllers/cinema.controller';

const router = express.Router();

router.get('/', getCinemas as any);
router.post('/', createCinema as any);
router.put('/:id', updateCinema as any);
router.delete('/:id', deleteCinema as any);

// Routes Quản lý Phòng Chiếu (Rooms)
router.post('/:cinemaId/rooms', createRoomForCinema as any);
router.put('/rooms/:roomId', updateRoom as any);
router.delete('/rooms/:roomId', deleteRoom as any);

export default router;

