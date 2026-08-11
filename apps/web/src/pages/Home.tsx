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
      <section className="relative h-[85vh] bg-brand-charcoal overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80" 
            alt="Royal Saree Collection" 
            className="w-full h-full object-cover opacity-50 object-center"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-2xl text-white">
            <motion.span 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-amber-300 text-xs font-extrabold tracking-widest uppercase block mb-3 bg-amber-950/60 w-fit px-3 py-1 rounded-full border border-amber-500/40"
            >
              ✨ Ram Ji Collection — Royal Saree Boutique
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight uppercase"
            >
              Elegance Woven in <br />
              <span className="text-brand-gold font-serif italic text-3xl sm:text-5xl">Every Thread</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-4 text-sm text-amber-50 leading-relaxed font-medium max-w-xl"
            >
              Discover timeless sarees crafted for every special occasion. Pure Banarasi Silk, Jaipuri Bandhani, Sheer Organza & Kanjeevaram weaves.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link 
                to="/shop" 
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-full hover:from-amber-600 hover:to-amber-700 transition-all shadow-xl"
              >
                Explore Sarees
              </Link>
              <Link 
                to="/shop?occasion=Bridal" 
                className="px-8 py-3.5 bg-white/10 backdrop-blur-md border border-amber-300/40 text-white font-extrabold text-xs uppercase tracking-widest rounded-full hover:bg-white hover:text-brand-charcoal transition-all"
              >
                Bridal Specials
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Selling Points */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex gap-4 p-6 border border-amber-100 rounded-2xl bg-gradient-to-br from-amber-50/50 to-white shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 flex-shrink-0 font-bold text-lg">
            ✨
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-charcoal">Pure Handloom Quality</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Certified authentic silk, Gaji, Organza & Katan fabrics sourced directly from weavers.</p>
          </div>
        </div>

        <div className="flex gap-4 p-6 border border-amber-100 rounded-2xl bg-gradient-to-br from-amber-50/50 to-white shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-800 flex-shrink-0 font-bold text-lg">
            👗
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-charcoal">Blouse Piece Included</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Every saree comes with matching unstitched blouse piece (0.8m - 1.0m).</p>
          </div>
        </div>

        <div className="flex gap-4 p-6 border border-amber-100 rounded-2xl bg-gradient-to-br from-amber-50/50 to-white shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 flex-shrink-0 font-bold text-lg">
            💬
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-charcoal">Direct WhatsApp Buy</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Inquire or order instantly on WhatsApp with direct video/photo preview.</p>
          </div>
        </div>
      </section>

      {/* 3. Saree Category Carousel Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-amber-600 text-xs font-extrabold uppercase tracking-widest">Heritage Weaves</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal mt-1">Shop by Saree Collection</h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-amber-700 flex items-center gap-1.5 hover:underline">
            View All Sarees <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Banarasi Sarees */}
          <Link to="/shop?sareeStyle=Banarasi" className="group relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex items-end">
            <img 
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80" 
              alt="Banarasi Sarees" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative p-5 text-white w-full">
              <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-widest">Pure Katan Silk</span>
              <h3 className="text-base font-extrabold uppercase tracking-wider">Banarasi Sarees</h3>
              <p className="text-xs text-amber-100 mt-1 flex items-center gap-1">Explore Weaves <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></p>
            </div>
          </Link>

          {/* Bandhani Sarees */}
          <Link to="/shop?sareeStyle=Bandhani" className="group relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex items-end">
            <img 
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80" 
              alt="Bandhani Sarees" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative p-5 text-white w-full">
              <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-widest">Jaipuri Bandhej</span>
              <h3 className="text-base font-extrabold uppercase tracking-wider">Bandhani Sarees</h3>
              <p className="text-xs text-amber-100 mt-1 flex items-center gap-1">Explore Weaves <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></p>
            </div>
          </Link>

          {/* Organza Sarees */}
          <Link to="/shop?sareeStyle=Organza" className="group relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex items-end">
            <img 
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80" 
              alt="Organza Sarees" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative p-5 text-white w-full">
              <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-widest">Lightweight Sheer</span>
              <h3 className="text-base font-extrabold uppercase tracking-wider">Organza Sarees</h3>
              <p className="text-xs text-amber-100 mt-1 flex items-center gap-1">Explore Weaves <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></p>
            </div>
          </Link>

          {/* Kanjeevaram Silk */}
          <Link to="/shop?sareeStyle=Kanjeevaram" className="group relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex items-end">
            <img 
              src="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80" 
              alt="Kanjeevaram Silk Sarees" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative p-5 text-white w-full">
              <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-widest">Bridal Mulberry Silk</span>
              <h3 className="text-base font-extrabold uppercase tracking-wider">Kanjeevaram Silk</h3>
              <p className="text-xs text-amber-100 mt-1 flex items-center gap-1">Explore Weaves <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></p>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Featured Saree Product Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-amber-600 text-xs font-extrabold uppercase tracking-widest">Featured Drapes</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal mt-1">Bestselling Sarees</h2>
          <p className="text-xs text-gray-500 mt-2 font-medium">Handcrafted with pure zari, gota patti work and regal embroidery for special occasions.</p>
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

      {/* 5. Direct WhatsApp & Custom Order Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl overflow-hidden relative p-8 sm:p-14 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl border border-amber-500/20">
          <div className="max-w-lg relative z-10 text-white space-y-3">
            <span className="text-amber-300 text-xs font-extrabold uppercase tracking-widest bg-amber-900/80 px-3 py-1 rounded-full border border-amber-400/30">
              💬 Direct WhatsApp Orders
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">Need Custom Color or Video Preview?</h3>
            <p className="text-xs text-amber-100 leading-relaxed font-medium">
              Talk directly with Ram Ji Collection team on WhatsApp to see live saree videos, inspect drape quality or place custom orders!
            </p>
          </div>
          <div className="relative z-10 w-full sm:w-auto">
            <a 
              href="https://api.whatsapp.com/send?phone=918815179854&text=Hello%20Ram%20Ji%20Collection!%20I%20want%20to%20see%20your%20saree%20video%20previews."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-extrabold text-xs uppercase tracking-widest block text-center shadow-xl transition-all hover:scale-105"
            >
              Order on WhatsApp &rarr;
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
