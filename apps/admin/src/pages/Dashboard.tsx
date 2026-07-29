import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, ShoppingCart, UserCheck, Package, MessageSquare, Database, HardDrive, Zap } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalSales: number;
}

interface SystemStats {
  whatsapp: {
    used: number;
    limit: number;
    remaining: number;
  };
  database: {
    sizeMB: number;
    totalRecords: number;
  };
  mediaStorage: {
    sizeMB: number;
    totalFiles: number;
  };
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
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [chartData, setChartData] = useState<SalesCategory[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data.stats);
        if (res.data.data.systemStats) {
          setSystemStats(res.data.data.systemStats);
        }
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

  const whatsappUsed = systemStats?.whatsapp.used || 0;
  const whatsappLimit = systemStats?.whatsapp.limit || 1000;
  const whatsappRemaining = systemStats?.whatsapp.remaining || 1000;
  const whatsappPercent = Math.min(100, Math.round((whatsappUsed / whatsappLimit) * 100));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-brand-dark">Dashboard Overview</h1>
        <p className="text-xs text-gray-400 font-semibold">Real-time metrics aggregating boutique activity & system quotas.</p>
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

      {/* SYSTEM RESOURCES & QUOTAS CARDS SECTION */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-dark flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-gold" /> System Resources & Free Quota Usage
            </h3>
            <p className="text-xs text-gray-400 font-medium">Real-time status of Meta WhatsApp free tokens, database size, and photo storage.</p>
          </div>
          <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-full uppercase">
            Active System
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Meta WhatsApp Free Conversations Quota */}
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-emerald-600">
                <MessageSquare className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">WhatsApp Free Quota</h4>
              </div>
              <span className="text-[11px] font-black text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded">
                1,000 Free / Mo
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>{whatsappUsed} Conversations Used</span>
                <span className="text-gray-400">{whatsappRemaining} Remaining</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${whatsappPercent}%` }} 
                />
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-gray-400 font-semibold pt-1">
              <span>Monthly Refresh Cycle</span>
              <span>Status: Healthy</span>
            </div>
          </div>

          {/* Card 2: Database Storage Used */}
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-indigo-600">
                <Database className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Database Storage</h4>
              </div>
              <span className="text-[11px] font-black text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded">
                Neon Postgres
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black text-brand-dark">{systemStats?.database.sizeMB || 0}</span>
                <span className="text-xs font-bold text-gray-400 ml-1">MB Used</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-indigo-600 block">{systemStats?.database.totalRecords || 0}</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Total Entries</span>
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-gray-400 font-semibold pt-1">
              <span>Connection Pool: Active</span>
              <span>Cloud PostgreSQL</span>
            </div>
          </div>

          {/* Card 3: Photo / Media Storage Used */}
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-amber-600">
                <HardDrive className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Photo Storage (MB)</h4>
              </div>
              <span className="text-[11px] font-black text-amber-600 bg-amber-100/60 px-2 py-0.5 rounded">
                Media Files
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black text-brand-dark">{systemStats?.mediaStorage.sizeMB || 0}</span>
                <span className="text-xs font-bold text-gray-400 ml-1">MB Total</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-amber-600 block">{systemStats?.mediaStorage.totalFiles || 0}</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Uploaded Files</span>
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-gray-400 font-semibold pt-1">
              <span>Cloud Storage / Uploads</span>
              <span>High Performance</span>
            </div>
          </div>

        </div>
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
