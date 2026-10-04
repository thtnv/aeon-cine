import express from 'express';
import { getPrices, updatePrices } from '../controllers/price.controller';

const router = express.Router();

router.get('/', getPrices);
router.put('/', updatePrices);
router.post('/', updatePrices);

export default router;

