import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../context/store';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { items, totalPrice, updateQuantity, removeItem, loading } = useCartStore();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md transform transition duration-500 ease-in-out glass shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-brand-charcoal flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-gold" />
              Your Cart
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 py-6 overflow-y-auto px-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Your cart is empty</h3>
                <p className="text-gray-500 text-sm mb-6">Start browsing our collection to find premium clothes.</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-brand-charcoal text-white rounded-full text-sm font-semibold hover:bg-brand-gold transition-all duration-300"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4">
                  {/* Product Image */}
                  <div className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img 
                      src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/150'} 
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-brand-charcoal line-clamp-1">
                        {item.product?.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">Brand: {item.product?.brand}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">Size: {item.size}</span>
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">Color: {item.color}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || loading}
                          className="p-1 hover:bg-gray-100 text-gray-500 disabled:opacity-50"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-brand-charcoal">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={loading}
                          className="p-1 hover:bg-gray-100 text-gray-500"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Pricing / Delete */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-brand-charcoal">
                          ₹{Math.round((item.product?.finalPrice || 0) * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-brand-red transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Billing Summary */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-5 bg-gray-50 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">Subtotal</span>
                <span className="text-lg font-bold text-brand-charcoal">₹{Math.round(totalPrice)}</span>
              </div>
              <p className="text-xs text-gray-400">Shipping and taxes calculated at checkout.</p>
              
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-brand-charcoal text-white rounded-full font-bold shadow-lg hover:bg-brand-gold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
