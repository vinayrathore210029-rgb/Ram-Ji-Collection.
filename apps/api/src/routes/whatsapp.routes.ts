import { Router } from 'express';
import { verifyWebhook, handleWebhook } from '../controllers/whatsapp.controller';

const router = Router();

// GET /api/whatsapp/webhook - Verification route for Meta
router.get('/webhook', verifyWebhook);

// POST /api/whatsapp/webhook - Incoming webhook notification route
router.post('/webhook', handleWebhook);

export default router;
