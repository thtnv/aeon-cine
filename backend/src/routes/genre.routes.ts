import express from 'express';
import { getGenres, createGenre, deleteGenre, updateGenre } from '../controllers/genre.controller';

const router = express.Router();

router.get('/', getGenres);
router.post('/', createGenre);
router.put('/:id', updateGenre);
router.delete('/:id', deleteGenre);

export default router;
