import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Product, Category } from '@ramjicollection/types';
import { ArrowRight, Star, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=4&sort=popular'),
          api.get('/categories')
        ]);
        setFeaturedProducts(prodRes.data.data.products);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative h-[80vh] bg-brand-charcoal overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop" 
            alt="Premium Boutique" 
            className="w-full h-full object-cover opacity-40 object-center"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-xl text-white">
            <motion.span 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-brand-gold text-xs font-extrabold tracking-widest uppercase block mb-3"
            >
              Exclusive Arrivals
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight uppercase"
            >
              Redefine Your <br />
              <span className="text-brand-gold font-light">Personal Style</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-4 text-sm text-gray-300 leading-relaxed font-medium"
            >
              Discover high-quality fabrics, customized shapes, and premium silhouettes engineered for active modern living.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 flex gap-4"
            >
              <Link 
                to="/shop" 
                className="px-8 py-3 bg-brand-gold text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-brand-goldHover transition-colors shadow-lg"
              >
                Shop Collection
              </Link>
              <Link 
                to="/shop?gender=MEN" 
                className="px-8 py-3 bg-transparent border border-white text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-white hover:text-brand-charcoal transition-all"
              >
                Explore Men
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Selling Points */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex gap-4 p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-brand-gold flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-charcoal">Express Shipping</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">Free secure delivery across India for all luxury purchases above ₹1,999.</p>
          </div>
        </div>

        <div className="flex gap-4 p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-brand-gold flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-charcoal">Genuine Guarantee</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">Authentic designer-grade fabrics sourced from certified Indian mills.</p>
          </div>
        </div>

        <div className="flex gap-4 p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-brand-gold flex-shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-charcoal">Easy Exchange</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">Hassle-free replacement policies within 7 days of verified deliveries.</p>
          </div>
        </div>
      </section>

      {/* 3. Category Carousel Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-brand-gold text-xs font-extrabold uppercase tracking-widest">Premium Categories</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal mt-1">Shop by Department</h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-brand-gold flex items-center gap-1.5 hover:underline">
            View All Shop <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Men Category */}
          <Link to="/shop?gender=MEN" className="group relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex items-end">
            <img 
              src="https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600&auto=format&fit=crop" 
              alt="Men" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="relative p-6 text-white w-full">
              <h3 className="text-lg font-bold uppercase tracking-wider">Men</h3>
              <p className="text-xs text-gray-300 mt-1 flex items-center gap-1">Browse Catalog <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></p>
            </div>
          </Link>

          {/* Women Category */}
          <Link to="/shop?gender=WOMEN" className="group relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex items-end">
            <img 
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop" 
              alt="Women" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="relative p-6 text-white w-full">
              <h3 className="text-lg font-bold uppercase tracking-wider">Women</h3>
              <p className="text-xs text-gray-300 mt-1 flex items-center gap-1">Browse Catalog <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></p>
            </div>
          </Link>

          {/* Kids Category */}
          <Link to="/shop?gender=KIDS" className="group relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex items-end">
            <img 
              src="https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop" 
              alt="Kids" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="relative p-6 text-white w-full">
              <h3 className="text-lg font-bold uppercase tracking-wider">Kids</h3>
              <p className="text-xs text-gray-300 mt-1 flex items-center gap-1">Browse Catalog <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></p>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Featured Product Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-brand-gold text-xs font-extrabold uppercase tracking-widest">Handpicked Favorites</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal mt-1">Trending New Arrivals</h2>
          <p className="text-xs text-gray-500 mt-2 font-medium">Explore premium items designed to command attention and offer absolute comfort.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Promotional Call-to-action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-charcoal rounded-3xl overflow-hidden relative p-8 sm:p-16 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop" 
              alt="Clothing texture" 
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="max-w-md relative z-10 text-white space-y-3">
            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Special Promo Offer</span>
            <h3 className="text-2xl sm:text-3xl font-bold uppercase">Join the Elite Club</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">Sign up for an account today and enjoy an extra **10% OFF** your first order, plus free updates on high-end capsules.</p>
          </div>
          <div className="relative z-10 w-full sm:w-auto">
            <Link 
              to="/auth"
              className="px-8 py-3.5 bg-brand-gold hover:bg-brand-goldHover text-white rounded-full font-bold text-xs uppercase tracking-widest block text-center shadow-lg transition-transform hover:scale-[1.02]"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
