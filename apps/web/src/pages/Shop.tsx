import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Product, Category } from '@ramjicollection/types';
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react';

const SAREE_STYLES = ['Banarasi', 'Bandhani', 'Organza', 'Kanjeevaram', 'Leheriya', 'Patola', 'Designer'];
const FABRIC_MATERIALS = ['Pure Silk', 'Georgette', 'Chiffon', 'Organza', 'Gaji Silk', 'Chanderi Cotton'];
const WORK_TYPES = ['Gota Patti', 'Zardosi', 'Mirror Work', 'Sequins', 'Handwork', 'Printed'];
const OCCASIONS = ['Bridal / Wedding', 'Party Wear', 'Haldi / Mehendi', 'Festive & Pooja'];
const SAREE_COLORS = ['Red', 'Maroon', 'Pink', 'Mustard Yellow', 'Royal Blue', 'Emerald Green', 'Golden', 'Orange', 'Purple', 'Pastel', 'Cream / White'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters read from URLs
  const catQuery = searchParams.get('categoryId') || '';
  const searchQ = searchParams.get('q') || '';
  const sareeStyleQuery = searchParams.get('sareeStyle') || '';
  const fabricQuery = searchParams.get('fabric') || '';
  const workTypeQuery = searchParams.get('workType') || '';
  const occasionQuery = searchParams.get('occasion') || '';
  const sortQuery = searchParams.get('sort') || 'latest';
  const pageQuery = searchParams.get('page') || '1';

  // Local filters
  const [selectedCat, setSelectedCat] = useState(catQuery);
  const [selectedStyle, setSelectedStyle] = useState(sareeStyleQuery);
  const [selectedFabric, setSelectedFabric] = useState(fabricQuery);
  const [selectedWork, setSelectedWork] = useState(workTypeQuery);
  const [selectedOccasion, setSelectedOccasion] = useState(occasionQuery);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState(sortQuery);

  useEffect(() => {
    setSelectedCat(catQuery);
    setSelectedStyle(sareeStyleQuery);
    setSelectedFabric(fabricQuery);
    setSelectedWork(workTypeQuery);
    setSelectedOccasion(occasionQuery);
    setSortBy(sortQuery);
    setCurrentPage(parseInt(pageQuery, 10));
  }, [catQuery, sareeStyleQuery, fabricQuery, workTypeQuery, occasionQuery, sortQuery, pageQuery]);

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
        const params = new URLSearchParams();
        if (searchQ) params.append('q', searchQ);
        if (selectedCat) params.append('categoryId', selectedCat);
        if (selectedStyle) params.append('sareeStyle', selectedStyle);
        if (selectedFabric) params.append('fabric', selectedFabric);
        if (selectedWork) params.append('workType', selectedWork);
        if (selectedOccasion) params.append('occasion', selectedOccasion);
        if (selectedColors.length > 0) params.append('color', selectedColors.join(','));
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        params.append('sort', sortBy);
        params.append('page', currentPage.toString());
        params.append('limit', '8');

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
  }, [searchQ, selectedCat, selectedStyle, selectedFabric, selectedWork, selectedOccasion, selectedColors, minPrice, maxPrice, sortBy, currentPage]);

  const updateUrlParams = (key: string, val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set(key, val);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const clearAllFilters = () => {
    setSelectedCat('');
    setSelectedStyle('');
    setSelectedFabric('');
    setSelectedWork('');
    setSelectedOccasion('');
    setSelectedColors([]);
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-dark flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-gold" /> Filter Sarees
        </h3>
        <button 
          onClick={clearAllFilters}
          className="text-[10px] text-amber-700 hover:underline font-bold flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Saree Style */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Saree Style</h4>
        <div className="space-y-1">
          {SAREE_STYLES.map((style) => (
            <button
              key={style}
              onClick={() => {
                const val = selectedStyle === style ? '' : style;
                setSelectedStyle(val);
                updateUrlParams('sareeStyle', val);
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedStyle === style ? 'bg-amber-100/70 text-amber-900 font-bold border border-amber-200' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Fabric */}
      <div className="space-y-2 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Fabric Material</h4>
        <div className="space-y-1">
          {FABRIC_MATERIALS.map((fab) => (
            <button
              key={fab}
              onClick={() => {
                const val = selectedFabric === fab ? '' : fab;
                setSelectedFabric(val);
                updateUrlParams('fabric', val);
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedFabric === fab ? 'bg-amber-100/70 text-amber-900 font-bold border border-amber-200' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {fab}
            </button>
          ))}
        </div>
      </div>

      {/* Work / Craft */}
      <div className="space-y-2 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Work / Craft</h4>
        <div className="space-y-1">
          {WORK_TYPES.map((work) => (
            <button
              key={work}
              onClick={() => {
                const val = selectedWork === work ? '' : work;
                setSelectedWork(val);
                updateUrlParams('workType', val);
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedWork === work ? 'bg-amber-100/70 text-amber-900 font-bold border border-amber-200' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {work}
            </button>
          ))}
        </div>
      </div>

      {/* Occasion */}
      <div className="space-y-2 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Occasion</h4>
        <div className="space-y-1">
          {OCCASIONS.map((occ) => (
            <button
              key={occ}
              onClick={() => {
                const val = selectedOccasion === occ ? '' : occ;
                setSelectedOccasion(val);
                updateUrlParams('occasion', val);
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedOccasion === occ ? 'bg-amber-100/70 text-amber-900 font-bold border border-amber-200' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {occ}
            </button>
          ))}
        </div>
      </div>

      {/* Saree Colors */}
      <div className="space-y-2 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Color Palette</h4>
        <div className="flex flex-wrap gap-2">
          {SAREE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => handleColorToggle(c)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                selectedColors.includes(c) ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Price Range (₹)</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-brand-gold font-semibold"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-brand-gold font-semibold"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="mb-8 border-b border-gray-100 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block mb-1">
            RAM JI COLLECTION EXCLUSIVE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-brand-dark">
            Handcrafted Saree Boutique
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Explore authentic Banarasi, Bandhani, Organza, Kanjeevaram, and designer sarees.
          </p>
        </div>

        {/* Sort Controls & Mobile Filter Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-dark rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-gold" /> Filter Sarees
          </button>

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                updateUrlParams('sort', e.target.value);
              }}
              className="bg-transparent outline-none cursor-pointer text-brand-dark font-bold"
            >
              <option value="latest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Popularity</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
          <FilterSidebar />
        </div>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex bg-black bg-opacity-50 backdrop-blur-sm lg:hidden">
            <div className="bg-white w-4/5 max-w-sm h-full p-6 overflow-y-auto shadow-2xl relative">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
              <FilterSidebar />
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-gray-100 animate-pulse h-80 rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-12 text-center space-y-4">
              <span className="text-4xl block">🥻</span>
              <h3 className="text-lg font-bold text-brand-dark uppercase tracking-wider">No Sarees Found</h3>
              <p className="text-xs text-gray-500">Try adjusting your filters or resetting search parameters.</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-brand-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-brand-gold transition-colors shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  const p = currentPage - 1;
                  setCurrentPage(p);
                  updateUrlParams('page', p.toString());
                }}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 text-brand-dark" />
              </button>

              <span className="text-xs font-extrabold px-4 text-brand-dark">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  const p = currentPage + 1;
                  setCurrentPage(p);
                  updateUrlParams('page', p.toString());
                }}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4 text-brand-dark" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
