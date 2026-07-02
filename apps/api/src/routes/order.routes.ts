import { Router } from 'express';
import {
  checkout,
  verifyPayment,
  getCustomerOrders,
  getOrderById,
  getAddresses,
  createAddress,
  deleteAddress,
  validateCoupon
} from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.post('/checkout', checkout);
router.post('/verify-payment', verifyPayment);
router.get('/', getCustomerOrders);
router.get('/addresses', getAddresses);
router.post('/addresses', createAddress);
router.delete('/addresses/:id', deleteAddress);
router.post('/coupons/validate', validateCoupon);
router.get('/:id', getOrderById);

export default router;
