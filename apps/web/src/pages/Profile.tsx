import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore, useWishlistStore } from '../context/store';
import ProductCard from '../components/ProductCard';
import { Order, Address } from '@ramjicollection/types';
import { User, ClipboardList, MapPin, Heart, LogOut, ShieldAlert, Trash2 } from 'lucide-react';

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get('tab') || 'profile';

  const { user, logout, deleteAccount } = useAuthStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  // Address creation form states
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressType, setAddressType] = useState('HOME');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        if (tab === 'orders') {
          const res = await api.get('/orders');
          setOrders(res.data.data);
        } else if (tab === 'addresses') {
          const res = await api.get('/orders/addresses');
          setAddresses(res.data.data);
        } else if (tab === 'wishlist') {
          await fetchWishlist();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tab, user]);

  const handleTabChange = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    const confirmMessage = 'kya aap sach me apna account permanently delete karna chahte hain? Isse aapka sara data delete ho jayega.';
    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteAccount();
      alert('Aapka account safaltapoorvak delete ho gaya hai.');
      navigate('/');
    } catch (err: any) {
      alert(err.toString() || 'Account delete karne me samasya aayi.');
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

      // Clear input fields
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
    } catch (err) {
      alert('Failed to save address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/orders/addresses/${id}`);
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  // Helper to color order status badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'PACKED': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'SHIPPED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'DELIVERED': return 'bg-green-50 text-green-600 border-green-100';
      case 'CANCELLED': return 'bg-red-50 text-brand-red border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">

      {/* 1. Left Nav Tabs Menu */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-6 h-fit">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-brand-gold font-bold text-sm uppercase">
            {user?.firstName.substring(0, 2)}
          </div>
          <div>
            <h3 className="text-xs font-bold text-brand-charcoal">{user?.firstName} {user?.lastName}</h3>
            <span className="text-[10px] text-gray-400 font-medium">{user?.email}</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-gray-500">
          <button
            onClick={() => handleTabChange('profile')}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors ${tab === 'profile' ? 'bg-amber-50/40 text-brand-gold' : 'hover:bg-gray-50 hover:text-brand-charcoal'
              }`}
          >
            <User className="w-4 h-4" /> Personal Details
          </button>

          <button
            onClick={() => handleTabChange('orders')}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors ${tab === 'orders' ? 'bg-amber-50/40 text-brand-gold' : 'hover:bg-gray-50 hover:text-brand-charcoal'
              }`}
          >
            <ClipboardList className="w-4 h-4" /> My Orders
          </button>

          <button
            onClick={() => handleTabChange('addresses')}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors ${tab === 'addresses' ? 'bg-amber-50/40 text-brand-gold' : 'hover:bg-gray-50 hover:text-brand-charcoal'
              }`}
          >
            <MapPin className="w-4 h-4" /> My Addresses
          </button>

          <button
            onClick={() => handleTabChange('wishlist')}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors ${tab === 'wishlist' ? 'bg-amber-50/40 text-brand-gold' : 'hover:bg-gray-50 hover:text-brand-charcoal'
              }`}
          >
            <Heart className="w-4 h-4" /> My Wishlist
          </button>

          <hr className="border-gray-100 my-2" />

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-brand-red hover:bg-rose-50"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </nav>
      </aside>

      {/* 2. Main Content tab panel */}
      <main className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold" />
          </div>
        ) : (
          <>
            {/* PROFILE TAB */}
            {tab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-base font-bold text-brand-charcoal border-b border-gray-100 pb-4">Personal Details</h2>
                <div className="grid grid-cols-2 gap-6 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium uppercase tracking-wider block mb-1">First Name</span>
                    <span className="text-brand-charcoal font-bold text-sm">{user?.firstName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium uppercase tracking-wider block mb-1">Last Name</span>
                    <span className="text-brand-charcoal font-bold text-sm">{user?.lastName}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 font-medium uppercase tracking-wider block mb-1">Email Address</span>
                    <span className="text-brand-charcoal font-bold text-sm">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium uppercase tracking-wider block mb-1">Phone Number</span>
                    <span className="text-brand-charcoal font-bold text-sm">{user?.phone || 'Not registered'}</span>
                  </div>
                </div>

                {/* Account Settings / Danger Zone */}
                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Account Settings
                  </h3>
                  <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-xs font-bold text-brand-charcoal">Delete Account</p>
                      <p className="text-[11px] text-gray-500 font-medium">Permanently remove your account and all associated order/address records.</p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-brand-red hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {tab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-base font-bold text-brand-charcoal border-b border-gray-100 pb-4">Order History</h2>
                {orders.length === 0 ? (
                  <p className="text-xs text-gray-400 font-bold py-12 text-center">You haven't placed any orders yet.</p>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => {
                      const displayAmount = order.payableAmount ?? order.totalAmount ?? 0;
                      return (
                        <div key={order.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white hover:border-amber-200 transition-all">

                          {/* Header banner stats */}
                          <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-gray-500">
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">Order ID</span>
                              <span className="text-brand-charcoal font-bold font-mono text-xs">#{order.id.substring(0, 8).toUpperCase()}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">Placed On</span>
                              <span className="text-brand-charcoal font-bold">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">Total Payable</span>
                              <span className="text-brand-charcoal font-black text-sm">₹{Math.round(displayAmount)}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">Payment</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${order.paymentStatus === 'PAID' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">Order Status</span>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] uppercase font-extrabold ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>

                          {/* Items listed with Product Photos */}
                          <div className="divide-y divide-gray-100 px-4 sm:px-6">
                            {order.items?.map((item) => {
                              const productObj = item.product;
                              const primaryImg = productObj?.images?.find((i: any) => i.isPrimary)?.url || productObj?.images?.[0]?.url || 'https://via.placeholder.com/150';

                              return (
                                <div key={item.id} className="flex justify-between items-center py-4 gap-4">
                                  <div className="flex gap-4 items-center min-w-0">
                                    <img
                                      src={primaryImg}
                                      alt={productObj?.name || 'Product'}
                                      className="w-16 h-20 bg-gray-50 rounded-xl object-cover flex-shrink-0 border border-gray-200 shadow-sm"
                                    />
                                    <div className="text-xs space-y-1 min-w-0">
                                      <h4 className="font-bold text-brand-charcoal text-xs truncate max-w-md">{productObj?.name || 'Purchased Item'}</h4>
                                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                                        {item.size && (
                                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-bold rounded border border-gray-200">
                                            Size: {item.size}
                                          </span>
                                        )}
                                        {item.color && (
                                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded border border-amber-200">
                                            Color: {item.color}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-gray-500 font-medium">
                                        Qty: <strong className="text-gray-900">{item.quantity}</strong> × ₹{Math.round(item.price)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-[10px] text-gray-400 font-bold block">Subtotal</span>
                                    <span className="text-xs font-black text-brand-dark">₹{Math.round(item.price * item.quantity)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Delivery Address Footer */}
                          {order.shippingAddress && (
                            <div className="bg-gray-50/70 p-3 px-4 sm:px-6 border-t border-gray-100 text-[11px] flex items-center justify-between text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                                <span className="font-medium truncate max-w-lg">
                                  Delivery to: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                                </span>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES TAB */}
            {tab === 'addresses' && (
              <div className="space-y-6">
                <h2 className="text-base font-bold text-brand-charcoal border-b border-gray-100 pb-4">My Shipping Addresses</h2>

                {/* Form to create address */}
                <form onSubmit={handleCreateAddress} className="grid grid-cols-2 gap-4 bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                  <h4 className="col-span-2 text-xs font-bold text-brand-charcoal uppercase">Add New Location</h4>

                  <div className="col-span-2 space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Street Address</span>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Flat, building details, sector, road"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">City</span>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City Name"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">State</span>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State Name"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Postal Code</span>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="PIN Code"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Type</span>
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
                  <div className="col-span-2 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-brand-charcoal text-white text-xs font-bold rounded-full hover:bg-brand-gold transition-colors"
                    >
                      Save Address
                    </button>
                  </div>
                </form>

                {/* Addresses listing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="border border-gray-200 rounded-xl p-4 bg-white space-y-3 relative shadow-sm">
                      <div>
                        <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-extrabold uppercase">
                          {addr.type}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[9px] bg-orange-50 px-2 py-0.5 rounded text-brand-gold font-extrabold uppercase ml-2">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {addr.street}, <br />
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-[10px] font-bold text-brand-red uppercase hover:underline block pt-2"
                      >
                        Delete Address
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WISHLIST TAB */}
            {tab === 'wishlist' && (
              <div className="space-y-6">
                <h2 className="text-base font-bold text-brand-charcoal border-b border-gray-100 pb-4">My Bookmarks</h2>
                {wishlistItems.length === 0 ? (
                  <p className="text-xs text-gray-400 font-bold py-12 text-center">Your wishlist is empty.</p>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                      item.product && <ProductCard key={item.id} product={item.product} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
