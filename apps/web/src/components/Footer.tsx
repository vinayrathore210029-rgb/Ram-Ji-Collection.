import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & About */}
          <div className="flex flex-col gap-4">
            <span className="text-xl font-bold tracking-wider uppercase text-brand-gold">
              RAM JI COLLECTION
            </span>
            <p className="text-xs text-gray-400 leading-relaxed">
              Satwas Dewas M.P — Handcrafted Royal Sarees Boutique. Pure Banarasi, Jaipuri Bandhej, Kanjeevaram & Organza Sarees.
            </p>
            <div className="flex gap-4 mt-2">
              <a 
                href="https://www.instagram.com/ramji_collection__/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <Instagram className="w-5 h-5 text-amber-400" /> @ramji_collection__
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-amber-400 uppercase mb-4">Saree Collections</h4>
            <ul className="space-y-2 text-xs text-gray-400 font-medium">
              <li><Link to="/shop?sareeStyle=Banarasi" className="hover:text-white transition-colors">Banarasi Silk Sarees</Link></li>
              <li><Link to="/shop?sareeStyle=Bandhani" className="hover:text-white transition-colors">Jaipuri Bandhani Sarees</Link></li>
              <li><Link to="/shop?sareeStyle=Organza" className="hover:text-white transition-colors">Organza Sheer Sarees</Link></li>
              <li><Link to="/shop?sareeStyle=Kanjeevaram" className="hover:text-white transition-colors">Kanjeevaram Bridal Silk</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop All Sarees</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-brand-gold uppercase mb-4">Store Policy</h4>
            <ul className="space-y-2 text-xs text-gray-400 font-medium">
              <li><span className="text-amber-400 font-bold">📲 WhatsApp Orders Only</span></li>
              <li><span className="text-gray-300">❌ No COD Available</span></li>
              <li><span className="text-gray-300">⏰ Call Time: 10am to 7pm</span></li>
              <li><Link to="/profile?tab=orders" className="hover:text-white transition-colors">Track Order Status</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider text-brand-gold uppercase mb-4">Store Address</h4>
            <div className="flex gap-3 text-xs text-gray-400">
              <MapPin className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <span>Joshila Hotel Ke Samne Road, Sangam Bidi Karkhana, Satwas, Dewas, M.P - 455441</span>
            </div>
            <div className="flex gap-3 text-xs text-gray-400">
              <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>+91 8815179854 / +91 7509467053</span>
            </div>
            <div className="flex gap-3 text-xs text-gray-400">
              <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>support@ramjicollection.com</span>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500 font-medium flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Ram Ji Collection. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
