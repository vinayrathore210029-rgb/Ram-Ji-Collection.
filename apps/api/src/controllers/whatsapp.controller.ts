import { Request, Response } from 'express';

/**
 * Verification endpoint for Meta WhatsApp Webhook setup (GET request)
 */
export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'ramji_whatsapp_verify_token_2026';

  if (mode && token) {
    if (mode === 'subscribe' && token === expectedToken) {
      console.log('WhatsApp Webhook verified successfully!');
      return res.status(200).send(challenge);
    } else {
      console.error('WhatsApp Webhook verification failed. Token mismatch.');
      return res.sendStatus(403);
    }
  }

  return res.sendStatus(400);
};

/**
 * Event handler endpoint for Meta WhatsApp Webhook (POST request)
 */
export const handleWebhook = (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach((entry: any) => {
        entry.changes?.forEach((change: any) => {
          const value = change.value;
          if (value?.messages) {
            console.log('Received WhatsApp Message:', JSON.stringify(value.messages, null, 2));
          }
          if (value?.statuses) {
            console.log('WhatsApp Message Status Update:', JSON.stringify(value.statuses, null, 2));
          }
        });
      });

      // Meta requires a quick 200 OK response within 20 seconds
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      return res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error handling WhatsApp Webhook:', error);
    return res.status(500).send('Internal Server Error');
  }
};
