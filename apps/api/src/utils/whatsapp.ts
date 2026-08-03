interface SendWhatsAppMessageOptions {
  to: string; // Phone number with country code (e.g. "919876543210")
  templateName?: string; // Template name registered in Meta Portal
  textMessage?: string; // Direct text message body
  languageCode?: string;
  parameters?: Array<{ type: string; text: string }>;
}

export interface OrderNotificationData {
  id: string;
  totalAmount: number;
  payableAmount?: number;
  user: {
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
  shippingAddress?: {
    fullName?: string;
    street?: string;
    streetAddress?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    googleMapsUrl?: string | null;
  } | null;
  items: Array<{
    quantity: number;
    price: number;
    size?: string | null;
    color?: string | null;
    product: {
      name: string;
    };
  }>;
}

/**
 * Format Order Purchase Notification Message
 */
export function formatOrderWhatsAppMessage(order: OrderNotificationData): string {
  const orderShortId = order.id.substring(0, 8).toUpperCase();
  const customerName = `${order.user.firstName} ${order.user.lastName}`.trim();
  
  let itemsList = '';
  order.items.forEach((item, index) => {
    const sizeColor = [item.size, item.color].filter(Boolean).join('/');
    const sizeColorText = sizeColor ? ` (${sizeColor})` : '';
    itemsList += `${index + 1}. *${item.product.name}*${sizeColorText}\n   • मात्रा (Qty): ${item.quantity} | मूल्य (Price): ₹${Math.round(item.price * item.quantity)}\n`;
  });

  let addressText = 'Address provided at checkout';
  if (order.shippingAddress) {
    const addr = order.shippingAddress;
    const st = addr.street || addr.streetAddress || '';
    addressText = `${st}, ${addr.city}, ${addr.state} - ${addr.postalCode}`;
    if (addr.googleMapsUrl) {
      addressText += `\n📍 *Map Location*: ${addr.googleMapsUrl}`;
    }
  }

  const finalPayable = Math.round(order.payableAmount ?? order.totalAmount);

  return `✨ *RAM JI COLLECTION* ✨\n` +
    `_Boutique & Ethnic Fashion_\n` +
    `────────────────────────\n\n` +
    `नमस्ते *${customerName}* जी 🙏\n` +
    `आपका ऑर्डर सफलतापूर्वक प्राप्त हो गया है!\n` +
    `_(Your order has been placed successfully!)_\n\n` +
    `📋 *ORDER SUMMARY / ऑर्डर विवरण*\n` +
    `• *Order ID*: #${orderShortId}\n` +
    `• *Total Amount / कुल राशि*: ₹${Math.round(order.totalAmount)}\n\n` +
    `🛒 *ITEMS ORDERED / खरीदे गए सामान*:\n${itemsList}\n` +
    `📍 *DELIVERY ADDRESS / डिलीवरी का पता*:\n${addressText}\n\n` +
    `────────────────────────\n` +
    `📞 *NEXT STEP / अगला चरण*:\n` +
    `• *हिंदी*: आपके ऑर्डर और पेमेंट विवरण को कन्फर्म करने के लिए हमारी टीम *राम जी कलेक्शन* (Ram Ji Collection) की तरफ से आपको बहुत जल्द **Call / WhatsApp** करेगी।\n` +
    `• *English*: Our team from *Ram Ji Collection* will Call / WhatsApp you shortly for order confirmation & payment details.\n\n` +
    `────────────────────────\n` +
    `💬 *CUSTOMER SUPPORT / ग्राहक सहायता*:\n` +
    `किसी भी सहायता के लिए संपर्क करें / For any help, contact us:\n` +
    `📞 *Call / WhatsApp*: *8815179854*\n\n` +
    `_नोट: यह एक ऑटोमेटेड मैसेज है, कृपया इस चैट पर रिप्लाई न करें।_\n` +
    `_Note: This is an automated notification, please do not reply to this chat._\n\n` +
    `राम जी कलेक्शन (Ram Ji Collection) को चुनने के लिए धन्यवाद! ❤️`;
}

/**
 * Send WhatsApp Notification using Meta Cloud API
 */
export async function sendWhatsAppNotification({
  to,
  templateName,
  textMessage,
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

  let bodyData: any;

  if (textMessage) {
    bodyData = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: textMessage
      }
    };
  } else {
    bodyData = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: templateName || 'hello_world',
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

    console.log('[WhatsApp API Success]: Order notification sent to', cleanPhone);
    return { success: true, data };
  } catch (error) {
    console.error('[WhatsApp API Exception]:', error);
    return { success: false, error };
  }
}
