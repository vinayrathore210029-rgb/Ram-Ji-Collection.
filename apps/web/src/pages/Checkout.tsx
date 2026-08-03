import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCartStore } from '../context/store';
import { Address } from '@ramjicollection/types';
import { MapPin, Tag, Plus, Check, PhoneCall, Navigation, MessageSquare } from 'lucide-react';

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
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [addressType, setAddressType] = useState('HOME');

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/orders/addresses');
      setAddresses(res.data.data);
      if (res.data.data.length > 0) {
        const def = res.data.data.find((addr: any) => addr.isDefault) || res.data.data[0];
        setSelectedAddressId(def.id);
      } else {
        setShowAddressForm(true);
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

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
        setGoogleMapsUrl(mapsUrl);
        setGeoLoading(false);
        alert('GPS Location captured successfully!');
      },
      (error) => {
        console.error(error);
        setGeoLoading(false);
        alert('Unable to retrieve location. Please enter your address details manually.');
      }
    );
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
        googleMapsUrl: googleMapsUrl || undefined,
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
      setGoogleMapsUrl('');
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
      // Create Order & send instant WhatsApp notification
      const res = await api.post('/orders/checkout', {
        shippingAddressId: selectedAddressId,
        billingAddressId: selectedAddressId,
        couponCode: activeCoupon?.code || undefined
      });

      const { order } = res.data.data;
      clearCart();
      navigate(`/order-success/${order.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Calculations
  const discount = activeCoupon ? (totalPrice * activeCoupon.discountPercent) / 100 : 0;
  const shipping = totalPrice > 1999 ? 0 : 150;
  const payableAmount = totalPrice - discount + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal mb-8 uppercase tracking-wide">Delivery & Order Confirmation</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (2 cols): Address selectors */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Call Confirmation Notification Card */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-md flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <PhoneCall className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider">No Immediate Online Payment Required</h3>
              <p className="text-xs text-amber-100 mt-1 font-medium leading-relaxed">
                Order submit karte hi aapko **WhatsApp message** mil jayega. Iske baad **Ram Ji Collection** ki team aapke paas phone call karke order aur payment details verify/confirm karegi.
              </p>
            </div>
          </div>

          {/* Shipping Addresses Section */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-brand-charcoal flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-gold" />
                Delivery Location & Address
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
                <div className="col-span-2 flex justify-between items-center bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-amber-600" /> Auto-Detect Delivery Location
                  </span>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={geoLoading}
                    className="px-3 py-1.5 bg-amber-600 text-white font-bold text-[11px] rounded-lg hover:bg-amber-700 transition-all flex items-center gap-1"
                  >
                    {geoLoading ? 'Detecting...' : 'Use My GPS Location'}
                  </button>
                </div>

                {googleMapsUrl && (
                  <div className="col-span-2 text-xs text-green-700 font-bold bg-green-50 p-2.5 border border-green-200 rounded-lg">
                    ✓ GPS Location Attached: {googleMapsUrl}
                  </div>
                )}

                <div className="col-span-2 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Street Address / Area</span>
                  <input 
                    type="text" 
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House number, landmark, street name"
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
                    placeholder="City"
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
                    placeholder="State"
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Postal Code (Pincode)</span>
                  <input 
                    type="text" 
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="452001"
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-brand-charcoal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-charcoal hover:bg-brand-gold text-white font-bold text-xs rounded-lg shadow-sm"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* List of saved addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div 
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`border rounded-xl p-4 cursor-pointer relative transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-brand-gold bg-amber-50/20 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {selectedAddressId === addr.id && (
                    <div className="absolute top-3 right-3 bg-brand-gold text-white p-1 rounded-full">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {addr.type}
                  </span>
                  <p className="text-xs font-bold text-brand-charcoal mt-2">{addr.street}</p>
                  <p className="text-xs text-gray-500">{addr.city}, {addr.state} - {addr.postalCode}</p>
                  {addr.googleMapsUrl && (
                    <a 
                      href={addr.googleMapsUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] text-amber-600 font-bold underline block mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📍 View Map Location
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cart items list preview */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-brand-charcoal border-b border-gray-100 pb-3">Order Items ({items.length})</h3>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.product?.images?.[0]?.url && (
                      <img src={item.product.images[0].url} alt="" className="w-12 h-12 object-cover rounded-lg" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-brand-charcoal">{item.product?.name}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity} | Size: {item.size} | Color: {item.color}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand-charcoal">₹{Math.round((item.product?.finalPrice || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Summary & Place Order */}
        <div className="space-y-6">
          
          {/* Coupon Code Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-gold" />
              Apply Discount Coupon
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="ENTER COUPON"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-brand-gold"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode}
                className="px-4 py-2 bg-brand-charcoal text-white text-xs font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {activeCoupon && (
              <p className="text-xs text-green-600 font-bold">
                ✓ Coupon Applied: {activeCoupon.discountPercent}% OFF
              </p>
            )}
          </div>

          {/* Pricing breakdown card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider border-b border-gray-100 pb-3">Payment Summary</h3>
            
            <div className="space-y-2 text-xs font-medium text-gray-500">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-brand-charcoal">₹{Math.round(totalPrice)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{Math.round(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-brand-charcoal">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-extrabold text-brand-charcoal">
                <span>Total Payable Amount</span>
                <span className="text-brand-gold">₹{Math.round(payableAmount)}</span>
              </div>
            </div>

            {/* Instant Order Submit Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={checkoutLoading || !selectedAddressId}
              className="w-full py-4 bg-brand-gold hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-full shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 mt-4"
            >
              <MessageSquare className="w-4 h-4" />
              {checkoutLoading ? 'Placing Order...' : 'Confirm & Send Order via WhatsApp'}
            </button>

            <p className="text-[10px] text-gray-400 text-center font-medium leading-relaxed">
              Order place hote hi WhatsApp notification bhej di jayegi aur humare executive call karke order verify karenge.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}
