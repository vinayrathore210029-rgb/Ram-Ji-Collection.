import { Router } from 'express';
import {
  getDashboardStats,
  getCustomers,
  getBanners,
  createBanner,
  deleteBanner,
  getCoupons,
  createCoupon,
  deleteCoupon
} from '../controllers/admin.controller';
import { adminGetOrders, adminUpdateOrderStatus } from '../controllers/order.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Public routes for banners (so client app can fetch banners for homepage)
router.get('/banners', getBanners);

// Protected Admin Routes
router.use(authenticate, authorizeAdmin);

router.get('/stats', getDashboardStats);
router.get('/customers', getCustomers);
router.get('/orders', adminGetOrders);
router.put('/orders/:id', adminUpdateOrderStatus);

router.post('/banners', upload.single('image'), createBanner);
router.delete('/banners/:id', deleteBanner);

router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.delete('/coupons/:id', deleteCoupon);

export default router;
