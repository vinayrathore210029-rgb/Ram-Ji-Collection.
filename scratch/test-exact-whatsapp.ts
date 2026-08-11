import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testExactWhatsApp() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '1242579422267973';
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  const targetPhone = '919294792230';

  console.log('Sending text message to:', targetPhone);

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: targetPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: `Welcome to Ram Ji Collection! 🛍️✨\n\nThank you for reaching out! Explore our website:\nhttps://ram-ji-collection-web-one.vercel.app/`
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log('Status Code:', response.status);
  console.log('Response Body:', JSON.stringify(data, null, 2));
}

testExactWhatsApp().catch(console.error);
