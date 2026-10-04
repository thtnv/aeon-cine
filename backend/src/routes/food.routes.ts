import { Router } from 'express';
import { getAllFood, createFood, updateFood, deleteFood } from '../controllers/food.controller';

const router = Router();

router.get('/', getAllFood);
router.post('/', createFood);
router.put('/:id', updateFood);
router.delete('/:id', deleteFood);

export default router;
