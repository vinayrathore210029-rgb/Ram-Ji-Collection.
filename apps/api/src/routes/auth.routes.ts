import { Router } from 'express';
import { register, login, me, refresh, deleteAccount } from '../controllers/auth.controller';
import { sendOtp, verifyOtp } from '../controllers/otp.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', authenticate, me);
router.delete('/account', authenticate, deleteAccount);

export default router;
