import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Order } from '@ramjicollection/types';
import { ClipboardList, Check } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
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
      alert('Failed to update status');
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
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-brand-dark">Order Management</h1>
        <p className="text-xs text-gray-400 font-semibold">Track and process e-commerce checkout purchases.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-gold" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-gray-500">
              <thead className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Placed Date</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4 text-right">Process Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-brand-dark">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 font-mono text-[10px] text-gray-400">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      {order.user ? (
                        <div>
                          <span className="block font-bold text-brand-charcoal">{order.user.firstName} {order.user.lastName}</span>
                          <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">{order.user.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Anonymous</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4">₹{Math.round(order.payableAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${
                        order.paymentStatus === 'PAID' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-brand-red border-red-100'
                      }`}>
                        {order.paymentStatus}
                      </span>
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
                        <option value="RETURNED">RETURNED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
