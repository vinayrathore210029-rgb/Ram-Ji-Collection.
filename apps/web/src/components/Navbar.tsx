import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useCartStore, useWishlistStore } from '../context/store';
import { Search, ShoppingBag, Heart, User as UserIcon, LogOut, Menu, X, ChevronDown, UserCheck } from 'lucide-react';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, logout } = useAuthStore();
  const { totalItems, fetchCart } = useCartStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    fetchCart();
    fetchWishlist();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when navigation occurs
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white bg-opacity-95 shadow-md py-3 backdrop-blur-md border-b border-gray-100' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Mobile Menu Icon */}
            <div className="flex lg:hidden">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="text-brand-charcoal p-1 hover:text-brand-gold transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Logo Brand */}
            <Link to="/" className="flex items-center gap-1.5 select-none">
              <span className="text-xl sm:text-2xl font-extrabold tracking-wider text-brand-charcoal font-sans uppercase">
                RAM JI <span className="text-brand-gold font-light">COLLECTION</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex space-x-8">
              <Link 
                to="/" 
                className={`text-sm font-semibold tracking-wide uppercase transition-colors hover:text-brand-gold ${
                  location.pathname === '/' ? 'text-brand-gold' : 'text-brand-charcoal'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/shop" 
                className={`text-sm font-semibold tracking-wide uppercase transition-colors hover:text-brand-gold ${
                  location.pathname === '/shop' && !location.search.includes('gender') ? 'text-brand-gold' : 'text-brand-charcoal'
                }`}
              >
                Shop All
              </Link>
              <Link 
                to="/shop?gender=MEN" 
                className={`text-sm font-semibold tracking-wide uppercase transition-colors hover:text-brand-gold ${
                  location.search.includes('gender=MEN') ? 'text-brand-gold' : 'text-brand-charcoal'
                }`}
              >
                Men
              </Link>
              <Link 
                to="/shop?gender=WOMEN" 
                className={`text-sm font-semibold tracking-wide uppercase transition-colors hover:text-brand-gold ${
                  location.search.includes('gender=WOMEN') ? 'text-brand-gold' : 'text-brand-charcoal'
                }`}
              >
                Women
              </Link>
              <Link 
                to="/shop?gender=KIDS" 
                className={`text-sm font-semibold tracking-wide uppercase transition-colors hover:text-brand-gold ${
                  location.search.includes('gender=KIDS') ? 'text-brand-gold' : 'text-brand-charcoal'
                }`}
              >
                Kids
              </Link>
            </nav>

            {/* Desktop / Action Buttons */}
            <div className="flex items-center space-x-4">
              
              {/* Search Toggle */}
              <div className="relative">
                {searchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-gray-100 rounded-full px-3 py-1.5 w-60 sm:w-72">
                    <input 
                      type="text" 
                      placeholder="Search collection..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-xs w-full pl-1.5"
                      autoFocus
                    />
                    <button type="submit" className="text-gray-500 hover:text-brand-gold p-0.5">
                      <Search className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600 ml-1 p-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button 
                    onClick={() => setSearchOpen(true)}
                    className="p-1.5 text-brand-charcoal hover:text-brand-gold transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Wishlist Link */}
              <Link 
                to="/profile?tab=wishlist" 
                className="p-1.5 text-brand-charcoal hover:text-brand-gold transition-colors relative"
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-gold text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button 
                onClick={() => setCartOpen(true)}
                className="p-1.5 text-brand-charcoal hover:text-brand-gold transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-charcoal text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Profile / Account Dropdown */}
              <div className="relative">
                {user ? (
                  <div>
                    <button 
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1 p-1 text-brand-charcoal hover:text-brand-gold transition-colors"
                    >
                      <UserCheck className="w-5 h-5 text-brand-gold" />
                      <span className="text-xs font-semibold hidden md:inline">{user.firstName}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                        <Link 
                          to="/profile" 
                          className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-gold"
                        >
                          My Profile
                        </Link>
                        <Link 
                          to="/profile?tab=orders" 
                          className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-gold"
                        >
                          My Orders
                        </Link>
                        {user.role === 'ADMIN' && (
                          <a 
                            href="http://localhost:5174" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block px-4 py-2 text-xs font-semibold text-brand-gold hover:bg-gray-50"
                          >
                            Admin Panel
                          </a>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <button 
                          onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-brand-red hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Log Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link 
                    to="/auth" 
                    className="p-1.5 text-brand-charcoal hover:text-brand-gold transition-colors"
                  >
                    <UserIcon className="w-5 h-5" />
                  </Link>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-lg font-bold tracking-widest text-brand-charcoal">MENU</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 p-1">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <nav className="flex flex-col space-y-4">
                  <Link to="/" className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Home</Link>
                  <Link to="/shop" className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Shop All</Link>
                  <Link to="/shop?gender=MEN" className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Men</Link>
                  <Link to="/shop?gender=WOMEN" className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Women</Link>
                  <Link to="/shop?gender=KIDS" className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Kids</Link>
                </nav>
              </div>

              {user ? (
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }}
                  className="w-full py-2.5 border border-brand-red text-brand-red rounded-full font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              ) : (
                <Link 
                  to="/auth" 
                  className="w-full py-2.5 bg-brand-charcoal text-white rounded-full font-bold text-center block"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
      {/* Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      {/* Spacer to push content below non-sticky headers if needed */}
      <div className="h-20" />
    </>
  );
}
