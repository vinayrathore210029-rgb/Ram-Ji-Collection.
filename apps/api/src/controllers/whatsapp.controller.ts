import { Request, Response } from 'express';

/**
 * Send an automated text response back to the sender via Meta Graph API
 */
async function sendAutoReply(toPhoneNumber: string, textBody: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '1242579422267973';

  if (!token || token === 'your_whatsapp_access_token') {
    console.warn('[WhatsApp AutoReply] Missing WHATSAPP_ACCESS_TOKEN in .env');
    return;
  }

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhoneNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: textBody
        }
      })
    });

    const data = await response.json();
    console.log('[WhatsApp AutoReply Sent]:', data);
  } catch (error) {
    console.error('[WhatsApp AutoReply Error]:', error);
  }
}

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
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach((entry: any) => {
        entry.changes?.forEach((change: any) => {
          const value = change.value;
          if (value?.messages) {
            value.messages.forEach((msg: any) => {
              const from = msg.from; // Sender's phone number
              const messageText = msg.text?.body || '';

              console.log(`[WhatsApp Incoming] From: ${from}, Text: "${messageText}"`);

              // Auto-reply message for testing
              const replyText = `Welcome to Ram Ji Collection! 🛍️✨\n\nThank you for messaging us. Check out our latest fashion collections at:\nhttps://ram-ji-collection-web-one.vercel.app/\n\nHow can we help you today?`;

              // Send auto reply asynchronously
              sendAutoReply(from, replyText);
            });
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

/**
 * Direct test endpoint to trigger sending a WhatsApp message and return exact Meta response
 */
export const testSendWhatsApp = async (req: Request, res: Response) => {
  const to = (req.query.to as string) || '917723020933';
  const mode = req.query.mode as string;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '1242579422267973';

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const payload = mode === 'text' ? {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,
    type: 'text',
    text: {
      preview_url: false,
      body: `Welcome to Ram Ji Collection! 🛍️✨\n\nThank you for reaching out! Explore our website:\nhttps://ram-ji-collection-web-one.vercel.app/`
    }
  } : {
    messaging_product: 'whatsapp',
    to: to,
    type: 'template',
    template: {
      name: 'hello_world',
      language: {
        code: 'en_US'
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return res.status(response.status).json({ success: response.ok, status: response.status, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
