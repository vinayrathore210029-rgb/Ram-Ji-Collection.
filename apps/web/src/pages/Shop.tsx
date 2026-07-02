import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Product, Category } from '@ramjicollection/types';
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const SIZES_LIST = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS_LIST = ['Black', 'White', 'Blue', 'Red', 'Grey', 'Beige', 'Navy'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters read from URLs
  const genderQuery = searchParams.get('gender') || '';
  const catQuery = searchParams.get('categoryId') || '';
  const searchQ = searchParams.get('q') || '';
  const sortQuery = searchParams.get('sort') || 'latest';
  const pageQuery = searchParams.get('page') || '1';

  // Local filters
  const [selectedGender, setSelectedGender] = useState(genderQuery);
  const [selectedCat, setSelectedCat] = useState(catQuery);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState(sortQuery);

  useEffect(() => {
    // Sync URL queries to local state
    setSelectedGender(genderQuery);
    setSelectedCat(catQuery);
    setSortBy(sortQuery);
    setCurrentPage(parseInt(pageQuery, 10));
  }, [genderQuery, catQuery, sortQuery, pageQuery]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Construct query string
        const params = new URLSearchParams();
        if (searchQ) params.append('q', searchQ);
        if (selectedGender) params.append('gender', selectedGender);
        if (selectedCat) params.append('categoryId', selectedCat);
        if (selectedSizes.length > 0) params.append('size', selectedSizes.join(','));
        if (selectedColors.length > 0) params.append('color', selectedColors.join(','));
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        params.append('sort', sortBy);
        params.append('page', currentPage.toString());
        params.append('limit', '8'); // 8 per page

        const response = await api.get(`/products?${params.toString()}`);
        setProducts(response.data.data.products);
        setTotalPages(response.data.data.pagination.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQ, selectedGender, selectedCat, selectedSizes, selectedColors, minPrice, maxPrice, sortBy, currentPage]);

  const handleGenderToggle = (gender: string) => {
    const val = selectedGender === gender ? '' : gender;
    setSelectedGender(val);
    updateUrlParams('gender', val);
  };

  const handleCatToggle = (catId: string) => {
    const val = selectedCat === catId ? '' : catId;
    setSelectedCat(val);
    updateUrlParams('categoryId', val);
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
    setCurrentPage(1);
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
    setCurrentPage(1);
  };

  const updateUrlParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSortBy(val);
    updateUrlParams('sort', val);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedGender('');
    setSelectedCat('');
    setSortBy('latest');
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Search query header banner */}
      {searchQ && (
        <div className="mb-8 p-6 bg-white border border-gray-100 rounded-2xl flex justify-between items-center shadow-sm">
          <p className="text-sm font-semibold text-gray-500">
            Search results for: <span className="text-brand-charcoal font-bold">"{searchQ}"</span>
          </p>
          <button 
            onClick={() => updateUrlParams('q', '')}
            className="text-xs text-brand-gold font-bold hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* 1. Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h3 className="text-base font-bold text-brand-charcoal flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-gold" />
              Filter Collection
            </h3>
            <button 
              onClick={clearAllFilters}
              className="text-[10px] uppercase font-bold text-brand-gold tracking-wider hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Gender</h4>
            <div className="flex flex-wrap gap-2">
              {['MEN', 'WOMEN', 'KIDS', 'UNISEX'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => handleGenderToggle(gender)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedGender === gender
                      ? 'bg-brand-charcoal text-white border-brand-charcoal'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {gender.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Category</h4>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCatToggle(cat.id)}
                  className={`text-left text-xs py-1.5 font-semibold transition-colors flex justify-between ${
                    selectedCat === cat.id ? 'text-brand-gold' : 'text-gray-600 hover:text-brand-charcoal'
                  }`}
                >
                  <span>{cat.name}</span>
                  {selectedCat === cat.id && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Sizes</h4>
            <div className="flex flex-wrap gap-2">
              {SIZES_LIST.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeToggle(size)}
                  className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${
                    selectedSizes.includes(size)
                      ? 'bg-brand-charcoal text-white border-brand-charcoal'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Colors</h4>
            <div className="flex flex-wrap gap-2">
              {COLORS_LIST.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorToggle(color)}
                  className={`px-3 py-1 border text-xs font-semibold rounded-lg transition-all ${
                    selectedColors.includes(color)
                      ? 'bg-brand-charcoal text-white border-brand-charcoal'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Price Boundaries */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Price Range (₹)</h4>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-semibold outline-none"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input 
                type="number" 
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-semibold outline-none"
              />
            </div>
          </div>
        </aside>

        {/* 2. Main Product Grid Section */}
        <main className="flex-1 space-y-8">
          
          {/* Top sorting & stats bar */}
          <div className="flex justify-between items-center bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold">
              Showing <span className="text-brand-charcoal font-bold">{products.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select 
                value={sortBy} 
                onChange={handleSortChange}
                className="bg-transparent border-none text-xs font-bold outline-none text-brand-charcoal cursor-pointer"
              >
                <option value="latest">Latest Arrivals</option>
                <option value="popular">Popularity</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <span className="text-4xl">🛍️</span>
              <h3 className="text-lg font-bold text-brand-charcoal mt-4">No Products Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">No items in our collection matched your filter settings. Try adjusting your preferences.</p>
              <button 
                onClick={clearAllFilters}
                className="mt-6 px-6 py-2.5 bg-brand-charcoal text-white rounded-full text-xs font-bold hover:bg-brand-gold transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:border-gray-400 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${
                    currentPage === i + 1
                      ? 'bg-brand-charcoal text-white border-brand-charcoal'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:border-gray-400 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
