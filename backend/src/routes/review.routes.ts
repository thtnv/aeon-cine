import { Router } from 'express';
import { getMovieReviews, createReview } from '../controllers/review.controller';

const router = Router();

router.get('/movie/:movieId', getMovieReviews);
router.post('/', createReview);

export default router;
