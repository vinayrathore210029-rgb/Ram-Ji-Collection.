import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../context/store';
import { Heart, Star } from 'lucide-react';
import { Product } from '@ramjicollection/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isFav = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      toggleWishlist(product);
    } catch (err: any) {
      alert(err);
    }
  };

  const primaryImage = product.images?.find(img => img.isPrimary)?.url || 
                       product.images?.[0]?.url || 
                       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop';

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      {/* Product Image Panel */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        <img 
          src={primaryImage} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Wishlist Heart Overlay */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white bg-opacity-80 hover:bg-white text-gray-500 hover:text-brand-red shadow-sm transition-all duration-300"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-brand-red text-brand-red' : ''}`} />
        </button>

        {/* Badges Panel */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="bg-brand-red text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {Math.round(product.discount)}% Off
            </span>
          )}
          {product.bestSeller && (
            <span className="bg-brand-charcoal text-brand-gold text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Best Seller
            </span>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.brand}</span>
          <h3 className="text-sm font-semibold text-brand-charcoal mt-1 line-clamp-1 group-hover:text-brand-gold transition-colors">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.round(product.rating) ? 'fill-current' : 'text-gray-200'}`} 
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-bold">({product.rating || 5.0})</span>
          </div>
        </div>

        {/* Pricing tag */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-brand-charcoal">
              ₹{Math.round(product.finalPrice)}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                ₹{Math.round(product.price)}
              </span>
            )}
          </div>
          
          <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider group-hover:underline">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
