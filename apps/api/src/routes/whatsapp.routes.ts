import { Router } from 'express';
import { verifyWebhook, handleWebhook, testSendWhatsApp } from '../controllers/whatsapp.controller';

const router = Router();

// GET /api/whatsapp/webhook - Verification route for Meta
router.get('/webhook', verifyWebhook);

// POST /api/whatsapp/webhook - Incoming webhook notification route
router.post('/webhook', handleWebhook);

// GET /api/whatsapp/test-send - Test sending WhatsApp message directly
router.get('/test-send', testSendWhatsApp);

export default router;
