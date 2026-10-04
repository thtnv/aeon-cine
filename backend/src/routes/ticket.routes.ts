import { Router } from 'express';
import { verifyTicket } from '../controllers/ticket.controller';

const router = Router();

router.post('/verify', verifyTicket);

export default router;
