interface SendWhatsAppMessageOptions {
  to: string; // Phone number with country code (e.g. "919876543210")
  templateName: string; // Template name registered in Meta Portal (e.g. "hello_world" or "order_confirmation")
  languageCode?: string;
  parameters?: Array<{ type: string; text: string }>;
}

/**
 * Send WhatsApp Template Message using Meta Cloud API
 */
export async function sendWhatsAppNotification({
  to,
  templateName,
  languageCode = 'en_US',
  parameters = []
}: SendWhatsAppMessageOptions) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId || token === 'your_whatsapp_access_token') {
    console.warn('[WhatsApp API] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID in .env file.');
    return { success: false, reason: 'Configuration missing' };
  }

  // Clean phone number (remove +, spaces, dashes)
  const cleanPhone = to.replace(/\D/g, '');

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const bodyData: any = {
    messaging_product: 'whatsapp',
    to: cleanPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode
      }
    }
  };

  if (parameters.length > 0) {
    bodyData.template.components = [
      {
        type: 'body',
        parameters: parameters
      }
    ];
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp API Error]:', JSON.stringify(data, null, 2));
      return { success: false, error: data };
    }

    console.log('[WhatsApp API Success]: Message sent to', cleanPhone);
    return { success: true, data };
  } catch (error) {
    console.error('[WhatsApp API Exception]:', error);
    return { success: false, error };
  }
}
