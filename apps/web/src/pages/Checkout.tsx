import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCartStore } from '../context/store';
import { Address } from '@ramjicollection/types';
import { CreditCard, MapPin, Tag, Plus, Check } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // New address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressType, setAddressType] = useState('HOME');

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/orders/addresses');
      setAddresses(res.data.data);
      if (res.data.data.length > 0) {
        const def = res.data.data.find((addr: any) => addr.isDefault) || res.data.data[0];
        setSelectedAddressId(def.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      navigate('/shop');
      return;
    }
    fetchAddresses();
  }, [items]);

  // Load Razorpay checkout script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/orders/coupons/validate', {
        code: couponCode,
        amount: totalPrice
      });
      setActiveCoupon(res.data.data);
      alert('Promo code applied successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Invalid coupon');
      setActiveCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/orders/addresses', {
        street,
        city,
        state,
        postalCode,
        type: addressType,
        isDefault: addresses.length === 0
      });
      setAddresses(prev => [...prev, res.data.data]);
      setSelectedAddressId(res.data.data.id);
      setShowAddressForm(false);
      
      // Clear inputs
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
    } catch (err: any) {
      alert('Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a shipping address');
      return;
    }

    setCheckoutLoading(true);
    try {
      // 1. Create Order inside Backend & generate Razorpay ID
      const res = await api.post('/orders/checkout', {
        shippingAddressId: selectedAddressId,
        billingAddressId: selectedAddressId,
        couponCode: activeCoupon?.code || undefined
      });

      const { order, razorpayKey, razorpayOrder } = res.data.data;

      // 2. Load Payment Gateway
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Razorpay payment gateway failed to load. Are you offline?');
        setCheckoutLoading(false);
        return;
      }

      // 3. Trigger Razorpay Checkout Screen
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Ram Ji Collection',
        description: 'Elite Boutique Purchase',
        order_id: razorpayOrder.id,
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#c5a880' // Gold branding theme color
        },
        handler: async (response: any) => {
          // Trigger signature verification callback on backend
          try {
            setCheckoutLoading(true);
            await api.post('/orders/verify-payment', {
              orderId: order.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            });
            
            clearCart();
            alert('Payment verified and Order placed successfully!');
            navigate('/profile?tab=orders');
          } catch (verifyErr: any) {
            alert(verifyErr.response?.data?.message || 'Payment verification failed');
          } finally {
            setCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setCheckoutLoading(false);
            alert('Checkout screen closed. Order left pending.');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initialize checkout');
      setCheckoutLoading(false);
    }
  };

  // Calculations
  const discount = activeCoupon ? (totalPrice * activeCoupon.discountPercent) / 100 : 0;
  const shipping = totalPrice > 1999 ? 0 : 150;
  const payableAmount = totalPrice - discount + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal mb-8 uppercase tracking-wide">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (2 cols): Address selectors */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shipping Addresses Section */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-brand-charcoal flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-gold" />
                Shipping Address
              </h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-bold text-brand-gold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            </div>

            {/* Dynamic New Address Fields */}
            {showAddressForm && (
              <form onSubmit={handleCreateAddress} className="grid grid-cols-2 gap-4 bg-gray-50 border border-gray-100 p-5 rounded-xl">
                <div className="col-span-2 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Street Address</span>
                  <input 
                    type="text" 
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House number, suite, area name"
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">City</span>
                  <input 
                    type="text" 
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New Delhi"
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">State</span>
                  <input 
                    type="text" 
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Delhi"
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Postal Code</span>
                  <input 
                    type="text" 
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="110001"
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address Type</span>
                  <select 
                    value={addressType}
                    onChange={(e) => setAddressType(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs outline-none font-bold text-brand-charcoal cursor-pointer"
                  >
                    <option value="HOME">HOME</option>
                    <option value="WORK">WORK</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div className="col-span-2 flex gap-3 pt-2">
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-brand-charcoal text-white text-xs font-bold rounded-full hover:bg-brand-gold transition-colors"
                  >
                    Save Address
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-6 py-2.5 border border-gray-200 text-gray-500 text-xs font-bold rounded-full hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* List addresses */}
            {addresses.length === 0 ? (
              <p className="text-xs text-gray-400 font-bold py-6 text-center">No addresses registered. Please add a shipping location.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`border rounded-xl p-4 cursor-pointer relative transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-brand-gold bg-amber-50/20 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  >
                    {selectedAddressId === addr.id && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-gold text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-extrabold uppercase">
                      {addr.type}
                    </span>
                    <p className="text-xs text-gray-600 mt-2 font-medium leading-relaxed">
                      {addr.street}, <br />
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Product Items Panel */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-brand-charcoal border-b border-gray-100 pb-4">
              Review Bag Items ({items.length})
            </h3>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                      <img src={item.product?.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-charcoal line-clamp-1">{item.product?.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Size: {item.size} | Color: {item.color}</p>
                      <p className="text-[10px] text-gray-500 font-semibold mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand-charcoal">₹{Math.round((item.product?.finalPrice || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Columns (1 col): Bill summary & Razorpay payment trigger */}
        <div className="space-y-6">
          
          {/* Coupon / Promo Field */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-brand-gold" /> Add Promo Code
            </h4>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="PROMO10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={!!activeCoupon}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none uppercase"
              />
              {activeCoupon ? (
                <button
                  onClick={() => { setActiveCoupon(null); setCouponCode(''); }}
                  className="px-4 py-2 border border-brand-red text-brand-red rounded-lg text-xs font-bold hover:bg-rose-50"
                >
                  Clear
                </button>
              ) : (
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="px-4 py-2 bg-brand-charcoal text-white rounded-lg text-xs font-bold hover:bg-brand-gold disabled:opacity-50"
                >
                  Apply
                </button>
              )}
            </div>
          </div>

          {/* Pricing calculation summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-brand-charcoal border-b border-gray-100 pb-4">
              Order Summary
            </h3>
            
            <div className="space-y-3 text-xs font-medium text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-brand-charcoal font-bold">₹{Math.round(totalPrice)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount ({activeCoupon?.discountPercent}%)</span>
                  <span>- ₹{Math.round(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-brand-charcoal font-bold">
                  {shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}
                </span>
              </div>

              <hr className="border-gray-100 my-2" />

              <div className="flex justify-between text-sm text-brand-charcoal font-extrabold uppercase">
                <span>Total Payable</span>
                <span>₹{Math.round(payableAmount)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={checkoutLoading}
              className="w-full py-3.5 bg-brand-charcoal hover:bg-brand-gold text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {checkoutLoading ? 'Processing...' : 'Pay with Razorpay'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
