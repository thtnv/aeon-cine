import { Router } from 'express';
import { applyVoucher, getAllVouchers, createVoucher, updateVoucher, deleteVoucher } from '../controllers/voucher.controller';

const router = Router();

router.post('/apply', applyVoucher);
router.get('/', getAllVouchers);
router.post('/', createVoucher);
router.put('/:id', updateVoucher);
router.delete('/:id', deleteVoucher);

export default router;
