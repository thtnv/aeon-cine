import { Router } from 'express';
import { 
  createPaymentUrl, 
  confirmPayment, 
  confirmStripePayment, 
  handleStripeWebhook 
} from '../controllers/payment.controller';

const router = Router();

router.post('/create-url', createPaymentUrl);
router.post('/confirm', confirmPayment);
router.post('/confirm-stripe', confirmStripePayment);
router.post('/webhook', handleStripeWebhook);

export default router;
