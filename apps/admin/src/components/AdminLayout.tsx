import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../context/store';
import { LayoutDashboard, ShoppingBag, FolderOpen, ClipboardList, Users, LogOut, Award } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAdminAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: ShoppingBag },
    { label: 'Categories', path: '/categories', icon: FolderOpen },
    { label: 'Orders', path: '/orders', icon: ClipboardList },
    { label: 'Customers', path: '/customers', icon: Users }
  ];

  return (
    <div className="flex min-h-screen bg-brand-light">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-brand-charcoal text-white flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-5">
            <Award className="w-6 h-6 text-brand-gold" />
            <span className="font-extrabold tracking-wider uppercase text-sm text-brand-gold">Ram Ji Admin</span>
          </div>

          <nav className="space-y-1.5 flex flex-col">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive 
                      ? 'bg-brand-gold text-white shadow-md' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="border-t border-gray-800 pt-5 text-xs text-gray-500 font-semibold">
            Logged in as: <span className="text-white block mt-0.5">{user?.firstName} {user?.lastName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl bg-red-900/30 text-brand-red border border-red-900/50 text-xs font-bold uppercase tracking-wider hover:bg-brand-red hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
