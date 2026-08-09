import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Order } from '@ramjicollection/types';
import { Phone, Check, X, MapPin, ExternalLink, MessageSquare } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/admin/orders/${id}`, { status });
      alert(`Order status updated to ${status}!`);
      fetchOrders();
    } catch (err: any) {
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED': return 'bg-green-50 text-green-700 border-green-200';
      case 'PACKED': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SHIPPED': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-brand-dark">Order Call Verification & Approval</h1>
        <p className="text-xs text-gray-400 font-semibold">Review customer orders, call to verify details, and Accept or Reject orders.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-gold" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm font-bold text-gray-500">No orders found</p>
            <p className="text-xs text-gray-400 mt-1">Customer orders will appear here for call verification and approval.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-gray-500">
              <thead className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Customer & Contact</th>
                  <th className="px-6 py-4">Delivery Address</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-center">Call Action (Accept / Reject)</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-brand-dark">
                {orders.map((order) => {
                  const customerPhone = order.user?.phone || 'No phone';
                  const cleanPhone = customerPhone.replace(/\D/g, '');
                  const mapsUrl = (order.shippingAddress as any)?.googleMapsUrl;
                  const displayAmount = order.payableAmount ?? order.totalAmount ?? 0;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono">
                        <span className="block text-[11px] font-extrabold text-brand-charcoal">
                          #{order.id ? order.id.substring(0, 8).toUpperCase() : 'UNKNOWN'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {order.user ? (
                          <div className="space-y-1">
                            <span className="block font-bold text-brand-charcoal">
                              {order.user.firstName} {order.user.lastName}
                            </span>
                            <div className="flex items-center gap-2">
                              {order.user.phone && (
                                <>
                                  <a
                                    href={`tel:${order.user.phone}`}
                                    className="text-[11px] text-blue-600 font-bold flex items-center gap-1 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
                                  >
                                    <Phone className="w-3 h-3 text-blue-600" /> {order.user.phone}
                                  </a>
                                  <a
                                    href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                    title="Open WhatsApp Chat"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Guest</span>
                        )}
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        {order.shippingAddress ? (
                          <div className="space-y-0.5">
                            <p className="text-[11px] text-gray-700 leading-tight">
                              {order.shippingAddress.street || ''}, {order.shippingAddress.city || ''}, {order.shippingAddress.state || ''} - {order.shippingAddress.postalCode || ''}
                            </p>
                            {mapsUrl && (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-amber-600 font-bold flex items-center gap-1 hover:underline"
                              >
                                <MapPin className="w-3 h-3" /> View Map Location <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 font-normal">No address recorded</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-bold text-brand-charcoal text-sm">
                        ₹{Math.round(displayAmount)}
                      </td>

                      {/* Quick Accept / Reject Action Buttons */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                            disabled={order.status === 'CONFIRMED'}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all ${
                              order.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-700 cursor-default opacity-80'
                                : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            {order.status === 'CONFIRMED' ? 'Accepted' : 'Accept'}
                          </button>

                          <button
                            onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                            disabled={order.status === 'CANCELLED'}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all ${
                              order.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-700 cursor-default opacity-80'
                                : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            {order.status === 'CANCELLED' ? 'Rejected' : 'Reject'}
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 border rounded-lg cursor-pointer outline-none ${getStatusColor(order.status)}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PACKED">PACKED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
