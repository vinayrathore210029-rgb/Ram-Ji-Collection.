import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCartStore, useWishlistStore, useAuthStore } from '../context/store';
import { Product } from '@ramjicollection/types';
import { Star, Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isFav = product ? isInWishlist(product.id) : false;

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const prod = response.data.data;
      setProduct(prod);
      if (prod.images && prod.images.length > 0) {
        const primary = prod.images.find((img: any) => img.isPrimary)?.url || prod.images[0].url;
        setActiveImage(primary);
      }
      if (prod.sizes && prod.sizes.length > 0) {
        setSelectedSize(prod.sizes[0]);
      }
      if (prod.colors && prod.colors.length > 0) {
        setSelectedColor(prod.colors[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-gold" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-xl font-bold text-brand-charcoal">Product Not Found</h2>
        <button 
          onClick={() => navigate('/shop')}
          className="mt-4 px-6 py-2 bg-brand-charcoal text-white rounded-full text-xs font-bold"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      setErrorMsg('Please select size and color');
      return;
    }
    setErrorMsg('');
    setAddingToCart(true);
    try {
      await addItem({
        productId: product.id,
        quantity,
        size: selectedSize,
        color: selectedColor
      });
      alert('Product added to cart!');
    } catch (err: any) {
      setErrorMsg(err.toString());
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to leave a review');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${product.id}/reviews`, { rating, comment });
      alert('Review submitted successfully!');
      setComment('');
      fetchProduct(); // reload
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* 1. Product Layout Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Images Grid */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <img 
              src={activeImage || 'https://via.placeholder.com/600'} 
              alt={product.name}
              className="w-full h-full object-cover transition-all"
            />
          </div>
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === img.url ? 'border-brand-gold' : 'border-transparent opacity-75'
                  }`}
                >
                  <img src={img.url} alt="product thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <span className="text-xs text-brand-gold font-extrabold uppercase tracking-widest">{product.brand}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal">{product.name}</h1>
            
            {/* Rating summary */}
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-current' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-bold">
                ({product.reviews?.length || 0} customer reviews)
              </span>
            </div>

            {/* Pricing tag */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-2xl font-black text-brand-charcoal">₹{Math.round(product.finalPrice)}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-sm text-gray-400 line-through">₹{Math.round(product.price)}</span>
                  <span className="text-xs font-bold text-brand-red">({Math.round(product.discount)}% OFF)</span>
                </>
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Description */}
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Description</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">{product.description}</p>
          </div>

          {/* Attributes */}
          <div className="grid grid-cols-2 gap-4 text-xs font-medium border border-gray-100 p-4 rounded-xl bg-gray-50">
            <div>
              <span className="text-gray-400">Gender:</span> <span className="text-brand-charcoal font-semibold">{product.gender.toLowerCase()}</span>
            </div>
            <div>
              <span className="text-gray-400">Material:</span> <span className="text-brand-charcoal font-semibold">{product.material || 'Cotton blend'}</span>
            </div>
            <div>
              <span className="text-gray-400">SKU:</span> <span className="text-brand-charcoal font-semibold">{product.sku}</span>
            </div>
            <div>
              <span className="text-gray-400">Availability:</span> <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-brand-red'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Options: Sizes & Colors */}
          {product.stock > 0 && (
            <div className="space-y-4">
              {/* Sizes */}
              <div className="space-y-1.5">
                <span className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Select Size</span>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 border font-bold text-xs rounded-xl flex items-center justify-center transition-all ${
                        selectedSize === size
                          ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-1.5">
                <span className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Select Color</span>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-1.5 border text-xs font-semibold rounded-xl transition-all ${
                        selectedColor === color
                          ? 'bg-brand-charcoal text-white border-brand-charcoal'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {product.stock > 0 ? (
            <div className="space-y-3 pt-2">
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 py-3.5 bg-brand-charcoal hover:bg-brand-gold hover:scale-[1.01] text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {addingToCart ? 'Adding...' : 'Add to Bag'}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-full border border-gray-200 hover:border-brand-red hover:text-brand-red transition-all ${
                    isFav ? 'bg-rose-50 border-rose-200 text-brand-red' : 'bg-white text-gray-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-brand-red' : ''}`} />
                </button>
              </div>
              {errorMsg && <p className="text-xs text-brand-red font-semibold">{errorMsg}</p>}
            </div>
          ) : (
            <p className="text-sm text-brand-red font-bold py-3 bg-red-50 border border-red-100 rounded-xl text-center">
              Temporarily out of stock. Please check back later.
            </p>
          )}

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-6">
            <div className="flex items-center gap-1.5 justify-center">
              <Truck className="w-3.5 h-3.5 text-brand-gold" /> Free Delivery
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <RotateCcw className="w-3.5 h-3.5 text-brand-gold" /> 7 Days Returns
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" /> Secure Gateway
            </div>
          </div>

        </div>
      </div>

      {/* 2. Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 border-t border-gray-200">
        
        {/* Reviews Left: Write review */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-brand-charcoal">Customer Reviews</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">Have you bought this item? Share your feedback with other customers to help them select products.</p>
          
          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500">Rating</span>
                <div className="flex gap-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-0.5 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500">Your Feedback</span>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked or disliked about this product..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-brand-gold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-brand-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-brand-gold transition-colors"
              >
                {submittingReview ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          ) : (
            <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl text-center">
              <p className="text-xs text-gray-500 font-semibold mb-3">Please sign in to write reviews.</p>
              <button 
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-brand-charcoal text-white rounded-full text-xs font-bold"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Reviews Right: list */}
        <div className="lg:col-span-2 space-y-6 max-h-[500px] overflow-y-auto pr-2">
          {(!product.reviews || product.reviews.length === 0) ? (
            <p className="text-xs text-gray-400 font-bold py-12 text-center">No feedback yet. Be the first to share your thoughts!</p>
          ) : (
            product.reviews.map((rev) => (
              <div key={rev.id} className="border-b border-gray-100 pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-xs font-bold text-brand-charcoal">
                      {rev.user ? `${rev.user.firstName} ${rev.user.lastName}` : 'Anonymous'}
                    </h5>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-medium">{rev.comment}</p>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
