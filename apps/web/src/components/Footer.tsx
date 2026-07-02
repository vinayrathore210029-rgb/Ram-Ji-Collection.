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
              Curated premium clothing store dedicated to simplicity, excellence, and style. Elevate your wardrobe with our crafted catalog.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="text-gray-400 hover:text-brand-gold transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-gold transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-gold transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-brand-gold uppercase mb-4">Shop Category</h4>
            <ul className="space-y-2 text-xs text-gray-400 font-medium">
              <li><Link to="/shop?gender=MEN" className="hover:text-white transition-colors">Men's Wardrobe</Link></li>
              <li><Link to="/shop?gender=WOMEN" className="hover:text-white transition-colors">Women's Fashion</Link></li>
              <li><Link to="/shop?gender=KIDS" className="hover:text-white transition-colors">Kid's Apparels</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-brand-gold uppercase mb-4">Support</h4>
            <ul className="space-y-2 text-xs text-gray-400 font-medium">
              <li><Link to="/profile?tab=orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-brand-gold uppercase mb-4">Store Location</h4>
            <div className="flex gap-3 text-xs text-gray-400">
              <MapPin className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <span>123 Elite Plaza, Phase 1, Connaught Place, New Delhi, 110001</span>
            </div>
            <div className="flex gap-3 text-xs text-gray-400">
              <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>+91 98765 43210</span>
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
