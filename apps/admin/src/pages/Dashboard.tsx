import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, ShoppingCart, UserCheck, Package, ShoppingBag } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalSales: number;
}

interface SalesCategory {
  categoryName: string;
  sales: number;
}

interface RecentOrder {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  payableAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<SalesCategory[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data.stats);
        setChartData(res.data.data.salesByCategory);
        setRecentOrders(res.data.data.recentOrders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-brand-dark">Dashboard Overview</h1>
        <p className="text-xs text-gray-400 font-semibold">Real-time metrics aggregating boutique activity.</p>
      </div>

      {/* Grid Indicators Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Sales */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Total Sales</span>
            <h3 className="text-lg font-black text-brand-dark mt-0.5">₹{Math.round(stats?.totalSales || 0)}</h3>
          </div>
        </div>

        {/* Total Orders */}
        <Link to="/orders" className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4 hover:border-brand-gold/40 hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Total Orders</span>
            <h3 className="text-lg font-black text-brand-dark mt-0.5">{stats?.totalOrders || 0}</h3>
          </div>
        </Link>

        {/* Total Customers */}
        <Link to="/customers" className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4 hover:border-brand-gold/40 hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Customers</span>
            <h3 className="text-lg font-black text-brand-dark mt-0.5">{stats?.totalCustomers || 0}</h3>
          </div>
        </Link>

        {/* Total Products */}
        <Link to="/products" className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4 hover:border-brand-gold/40 hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="w-12 h-12 bg-orange-50 text-brand-gold rounded-full flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Products</span>
            <h3 className="text-lg font-black text-brand-dark mt-0.5">{stats?.totalProducts || 0}</h3>
          </div>
        </Link>

      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales by Category (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
          <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Sales by Category (INR)</h4>
          <div className="h-[300px] w-full text-xs font-semibold">
            {chartData.length === 0 ? (
              <p className="text-center py-20 text-gray-400">No category sales metrics available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="categoryName" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                  <Bar dataKey="sales" fill="#c5a880" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Orders (1 col) */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Recent Orders</h4>
          
          <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <p className="text-center text-xs py-10 text-gray-400">No orders registered.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-brand-dark">
                      {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Anonymous'}
                    </h5>
                    <span className="text-[10px] text-gray-400 font-medium block">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'short' })}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="font-bold text-brand-dark">₹{Math.round(order.payableAmount)}</span>
                    <span className={`block text-[9px] font-extrabold mt-0.5 ${
                      order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-brand-red'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
