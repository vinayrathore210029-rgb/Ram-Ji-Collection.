import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Order } from '@ramjicollection/types';
import { Phone, Check, X, MapPin, ExternalLink, MessageSquare, Eye, ShoppingBag, CreditCard, Tag, Calendar, User as UserIcon } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      
      // Update local selectedOrder state if open
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status: status as any } : null);
      }
      
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
        <p className="text-xs text-gray-400 font-semibold">Review customer orders, click any order to view full items with photos, and Accept or Reject orders.</p>
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
                  <th className="px-6 py-4">Items & Photos</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-center">Call Action (Accept / Reject)</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-brand-dark">
                {orders.map((order, idx) => {
                  if (!order || typeof order !== 'object') return null;
                  const orderId = order.id || `order-${idx}`;
                  const customerPhone = order.user?.phone || 'No phone';
                  const cleanPhone = customerPhone.replace(/\D/g, '');
                  const mapsUrl = (order.shippingAddress as any)?.googleMapsUrl;
                  const displayAmount = order.payableAmount ?? order.totalAmount ?? 0;
                  const itemsCount = (order as any).items?.length || 0;

                  return (
                    <tr 
                      key={orderId} 
                      className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4 font-mono">
                        <span className="block text-[11px] font-extrabold text-brand-charcoal">
                          #{order.id ? order.id.substring(0, 8).toUpperCase() : 'UNKNOWN'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                        </span>
                      </td>

                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
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

                      <td className="px-6 py-4 max-w-xs" onClick={(e) => e.stopPropagation()}>
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

                      {/* Items Preview & Photos Column */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-all text-[11px] font-bold"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-gold" />
                          <span>{itemsCount} {itemsCount === 1 ? 'Item' : 'Items'} (View Details)</span>
                        </button>
                      </td>

                      <td className="px-6 py-4 font-bold text-brand-charcoal text-sm">
                        ₹{Math.round(displayAmount)}
                      </td>

                      {/* Quick Accept / Reject Action Buttons */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
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

                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
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

      {/* Rich Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black tracking-wider font-mono text-brand-dark">
                    Order #{selectedOrder.id ? selectedOrder.id.substring(0, 8).toUpperCase() : ''}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 border rounded-lg ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' }) : ''}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Customer & Delivery Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Customer Box */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-brand-gold font-bold text-xs uppercase tracking-wider">
                  <UserIcon className="w-4 h-4" /> Customer Info
                </div>
                {selectedOrder.user ? (
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-gray-900 text-sm">
                      {selectedOrder.user.firstName} {selectedOrder.user.lastName}
                    </p>
                    <p className="text-gray-500 font-medium">{selectedOrder.user.email}</p>
                    {selectedOrder.user.phone && (
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${selectedOrder.user.phone}`}
                          className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg flex items-center gap-1.5 hover:bg-blue-700 transition-colors text-[11px]"
                        >
                          <Phone className="w-3 h-3" /> Call {selectedOrder.user.phone}
                        </a>
                        <a
                          href={`https://wa.me/${selectedOrder.user.phone.replace(/\D/g, '').length === 10 ? '91' + selectedOrder.user.phone.replace(/\D/g, '') : selectedOrder.user.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-green-600 text-white font-bold rounded-lg flex items-center gap-1.5 hover:bg-green-700 transition-colors text-[11px]"
                        >
                          <MessageSquare className="w-3 h-3" /> WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Guest Order</p>
                )}
              </div>

              {/* Delivery Address Box */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-brand-gold font-bold text-xs uppercase tracking-wider">
                  <MapPin className="w-4 h-4" /> Delivery Address
                </div>
                {selectedOrder.shippingAddress ? (
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-800 leading-relaxed font-medium">
                      {selectedOrder.shippingAddress.street || ''}, {selectedOrder.shippingAddress.city || ''}, {selectedOrder.shippingAddress.state || ''} - {selectedOrder.shippingAddress.postalCode || ''}
                    </p>
                    {(selectedOrder.shippingAddress as any)?.googleMapsUrl && (
                      <a
                        href={(selectedOrder.shippingAddress as any).googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-600 font-bold flex items-center gap-1.5 hover:underline pt-1 text-[11px]"
                      >
                        <MapPin className="w-3.5 h-3.5" /> View Exact GPS Location <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No address recorded</p>
                )}
              </div>

            </div>

            {/* Ordered Products Items List (With Photos!) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brand-gold" /> Ordered Products ({((selectedOrder as any).items || []).length} Items)
                </h4>
              </div>

              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {((selectedOrder as any).items || []).map((item: any, idx: number) => {
                  const productObj = item.product || {};
                  const primaryImg = productObj.images?.find((img: any) => img.isPrimary)?.url || productObj.images?.[0]?.url || 'https://via.placeholder.com/150';

                  return (
                    <div key={item.id || idx} className="p-4 bg-white hover:bg-gray-50 flex items-center gap-4 transition-colors">
                      {/* Product Thumbnail Photo */}
                      <img
                        src={primaryImg}
                        alt={productObj.name || 'Product Image'}
                        className="w-16 h-20 object-cover rounded-xl border border-gray-200 shadow-sm shrink-0 bg-gray-100"
                      />

                      {/* Product Info & Attributes */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h5 className="text-xs font-bold text-gray-900 truncate">
                          {productObj.name || 'Purchased Product'}
                        </h5>

                        <div className="flex items-center gap-2 flex-wrap">
                          {item.size && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-bold rounded text-[10px] border border-gray-200">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded text-[10px] border border-amber-200">
                              Color: {item.color}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-500 font-medium">
                            Qty: <strong className="text-gray-900">{item.quantity}</strong>
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-400">
                          Unit Price: ₹{Math.round(item.price)}
                        </p>
                      </div>

                      {/* Item Total Subtotal */}
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-400 block">Subtotal</span>
                        <span className="text-sm font-black text-brand-dark">
                          ₹{Math.round(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer / Order Summary & Quick Actions */}
            <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 rounded-xl text-brand-gold border border-amber-100">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Payable Amount</span>
                  <span className="text-xl font-black text-brand-dark">
                    ₹{Math.round(selectedOrder.payableAmount ?? selectedOrder.totalAmount ?? 0)}
                  </span>
                </div>
              </div>

              {/* Call Verification Accept / Reject Actions inside Modal */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedOrder.id, 'CONFIRMED')}
                  disabled={selectedOrder.status === 'CONFIRMED'}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <Check className="w-4 h-4" /> Accept Order
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedOrder.id, 'CANCELLED')}
                  disabled={selectedOrder.status === 'CANCELLED'}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <X className="w-4 h-4" /> Reject Order
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
