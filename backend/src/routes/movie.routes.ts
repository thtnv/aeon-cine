import { Router } from 'express';
import { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie } from '../controllers/movie.controller';

const router = Router();

router.get('/', getAllMovies as any);
router.get('/:id', getMovieById as any);
router.post('/', createMovie as any);
router.put('/:id', updateMovie as any);
router.delete('/:id', deleteMovie as any);

export default router;

