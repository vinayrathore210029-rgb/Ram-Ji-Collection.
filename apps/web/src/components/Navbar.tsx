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
      {/* Royal Indian Culture Top Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-200 text-[11px] font-bold py-1.5 px-4 text-center border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden sm:inline">🥻 Ram Ji Collection — Satwas Dewas M.P</span>
          <span className="mx-auto sm:mx-0">✨ Handcrafted Royal Indian Sarees | Pure Silk & Zari Weaves</span>
          <a href="https://api.whatsapp.com/send?phone=918815179854" target="_blank" rel="noreferrer" className="hidden md:inline hover:underline text-amber-300">
            💬 WhatsApp: +91 8815179854
          </a>
        </div>
      </div>

      <header 
        className={`sticky top-0 left-0 w-full z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white bg-opacity-95 shadow-md py-3 backdrop-blur-md border-b border-amber-100' 
            : 'bg-white py-4 border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo Brand (All the way on the Left!) */}
            <Link to="/" className="flex items-center gap-2 select-none flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Ram Ji Collection Logo" 
                className="w-7 h-7 sm:w-9 sm:h-9 object-contain rounded-full border border-amber-300/50 shadow-sm" 
              />
              <span className="text-xs sm:text-base md:text-xl font-extrabold tracking-wider text-brand-charcoal font-sans uppercase whitespace-nowrap">
                RAM JI <span className="text-brand-gold font-light">COLLECTION</span>
              </span>
            </Link>

            {/* Desktop Navigation Links (Pure Saree Store) */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link 
                to="/" 
                className={`text-xs font-bold tracking-wider uppercase transition-colors hover:text-brand-gold ${
                  location.pathname === '/' ? 'text-brand-gold' : 'text-brand-charcoal'
                }`}
              >
                Home
              </Link>
              
              <Link 
                to="/shop" 
                className={`text-xs font-bold tracking-wider uppercase transition-colors hover:text-brand-gold ${
                  location.pathname === '/shop' && !location.search ? 'text-brand-gold' : 'text-brand-charcoal'
                }`}
              >
                All Sarees
              </Link>

              {/* Dropdown 1: By Style */}
              <div className="relative group py-2">
                <button 
                  className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1 transition-colors hover:text-brand-gold ${
                    location.search.includes('sareeStyle') ? 'text-brand-gold' : 'text-brand-charcoal'
                  }`}
                >
                  By Style <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 w-52 bg-white rounded-xl shadow-xl border border-amber-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform translate-y-2 group-hover:translate-y-0">
                  <Link to="/shop?sareeStyle=Banarasi" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Banarasi Sarees</Link>
                  <Link to="/shop?sareeStyle=Bandhani" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Bandhani Sarees</Link>
                  <Link to="/shop?sareeStyle=Organza" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Organza Sarees</Link>
                  <Link to="/shop?sareeStyle=Kanjeevaram" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Kanjeevaram Silk</Link>
                  <Link to="/shop?sareeStyle=Leheriya" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Leheriya Sarees</Link>
                  <Link to="/shop?sareeStyle=Bollywood" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Bollywood / Designer</Link>
                </div>
              </div>

              {/* Dropdown 2: By Fabric */}
              <div className="relative group py-2">
                <button 
                  className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1 transition-colors hover:text-brand-gold ${
                    location.search.includes('fabric') ? 'text-brand-gold' : 'text-brand-charcoal'
                  }`}
                >
                  By Fabric <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 w-52 bg-white rounded-xl shadow-xl border border-amber-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform translate-y-2 group-hover:translate-y-0">
                  <Link to="/shop?fabric=Pure+Silk" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Pure Silk</Link>
                  <Link to="/shop?fabric=Georgette" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Georgette</Link>
                  <Link to="/shop?fabric=Chiffon" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Chiffon</Link>
                  <Link to="/shop?fabric=Organza" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Organza Sheer</Link>
                  <Link to="/shop?fabric=Gaji+Silk" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Gaji Silk</Link>
                </div>
              </div>

              {/* Dropdown 3: By Occasion */}
              <div className="relative group py-2">
                <button 
                  className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1 transition-colors hover:text-brand-gold ${
                    location.search.includes('occasion') ? 'text-brand-gold' : 'text-brand-charcoal'
                  }`}
                >
                  By Occasion <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 w-52 bg-white rounded-xl shadow-xl border border-amber-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform translate-y-2 group-hover:translate-y-0">
                  <Link to="/shop?occasion=Bridal" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Bridal / Wedding</Link>
                  <Link to="/shop?occasion=Party+Wear" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Party Wear</Link>
                  <Link to="/shop?occasion=Haldi" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Haldi / Mehendi</Link>
                  <Link to="/shop?occasion=Festive" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Festive & Pooja</Link>
                </div>
              </div>

              {/* Dropdown 4: By Work */}
              <div className="relative group py-2">
                <button 
                  className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1 transition-colors hover:text-brand-gold ${
                    location.search.includes('workType') ? 'text-brand-gold' : 'text-brand-charcoal'
                  }`}
                >
                  By Craft <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 w-52 bg-white rounded-xl shadow-xl border border-amber-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform translate-y-2 group-hover:translate-y-0">
                  <Link to="/shop?workType=Gota+Patti" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Gota Patti Work</Link>
                  <Link to="/shop?workType=Zardosi" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Zardosi Weave</Link>
                  <Link to="/shop?workType=Mirror+Work" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Mirror Work</Link>
                  <Link to="/shop?workType=Sequins" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Sequins Work</Link>
                </div>
              </div>
            </nav>

            {/* Desktop / Action Buttons */}
            <div className="flex items-center space-x-4">
              
              {/* Search Toggle */}
              <div className="relative">
                {searchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-gray-100 rounded-full px-3 py-1.5 w-60 sm:w-72">
                    <input 
                      type="text" 
                      placeholder="Search sarees by fabric, work..."
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

              {/* Mobile Menu Icon (Extreme Right on Mobile!) */}
              <div className="flex lg:hidden">
                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="text-brand-charcoal p-1.5 hover:text-brand-gold transition-colors"
                  title="Open Navigation Menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold tracking-widest text-brand-charcoal">SAREE STORE</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 p-1">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <nav className="flex flex-col space-y-4">
                  <Link to="/" className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Home</Link>
                  <Link to="/shop" className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">All Sarees</Link>
                  
                  {/* Saree Categories Accordion */}
                  <div className="border-b border-gray-100 pb-3 space-y-2">
                    <span className="text-sm font-extrabold text-amber-900 uppercase tracking-wider block">Shop By Style</span>
                    <div className="pl-3 space-y-1 text-xs text-gray-600">
                      <Link to="/shop?sareeStyle=Banarasi" className="block py-1">Banarasi Sarees</Link>
                      <Link to="/shop?sareeStyle=Bandhani" className="block py-1">Bandhani Sarees</Link>
                      <Link to="/shop?sareeStyle=Organza" className="block py-1">Organza Sarees</Link>
                      <Link to="/shop?sareeStyle=Kanjeevaram" className="block py-1">Kanjeevaram Silk</Link>
                      <Link to="/shop?sareeStyle=Leheriya" className="block py-1">Leheriya Sarees</Link>
                      <Link to="/shop?fabric=Pure+Silk" className="block py-1">Pure Silk</Link>
                      <Link to="/shop?occasion=Bridal" className="block py-1 font-bold text-amber-800">Bridal Specials</Link>
                    </div>
                  </div>
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
