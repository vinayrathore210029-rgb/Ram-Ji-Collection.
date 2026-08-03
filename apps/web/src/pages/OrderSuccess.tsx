import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Phone, MessageSquare, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/orders/${id}`)
        .then(res => setOrder(res.data.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  const shortOrderId = id ? id.substring(0, 8).toUpperCase() : '';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xl text-center space-y-8">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-wide">
            ऑर्डर सफलतापूर्वक दर्ज हुआ!
          </h1>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
            Order Placed Successfully • ID: #{shortOrderId}
          </p>
        </div>

        {/* Call Notice Card */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 rounded-2xl p-6 text-left space-y-3 shadow-sm">
          <div className="flex items-center gap-3 text-amber-900 font-bold text-base">
            <Phone className="w-5 h-5 text-amber-700 animate-pulse flex-shrink-0" />
            <span>अगला चरण: ऑर्डर कन्फर्मेशन कॉल (Next Step)</span>
          </div>
          
          <div className="space-y-2 text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
            <p>
              • <strong>हिंदी</strong>: आपके ऑर्डर और पेमेंट विवरण को कन्फर्म करने के लिए हमारी टीम <strong>राम जी कलेक्शन (Ram Ji Collection)</strong> की तरफ से आपको बहुत जल्द <strong>Call / WhatsApp</strong> करेगी।
            </p>
            <p>
              • <strong>English</strong>: Our team from <strong>Ram Ji Collection</strong> will Call / WhatsApp you shortly to confirm your order details and payment method.
            </p>
          </div>
        </div>

        {/* Customer Support Contact */}
        <div className="border-t border-b border-gray-100 py-6 space-y-3">
          <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
            Customer Support / ग्राहक सहायता
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:8815179854"
              className="px-6 py-3 bg-brand-charcoal text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-brand-gold transition-colors shadow-md"
            >
              <Phone className="w-4 h-4 text-brand-gold" /> Call: 8815179854
            </a>
            <a
              href="https://wa.me/918815179854?text=Namaste%20Ram%20Ji%20Collection,%20I%20have%20a%20query%20regarding%20my%20Order%20"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-green-700 transition-colors shadow-md"
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp Support
            </a>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
          <Link
            to="/profile?tab=orders"
            className="px-8 py-3.5 bg-brand-gold text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-brand-goldHover transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> View My Orders
          </Link>
          <Link
            to="/shop"
            className="px-8 py-3.5 border border-gray-200 text-brand-dark font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
