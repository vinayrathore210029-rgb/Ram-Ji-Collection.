import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Product, Category } from '@ramjicollection/types';
import { ShoppingBag, Plus, Trash2, Edit, X } from 'lucide-react';

const SIZES_LIST = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS_LIST = ['Black', 'White', 'Blue', 'Red', 'Grey', 'Beige', 'Navy'];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [gender, setGender] = useState('UNISEX');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [stock, setStock] = useState('10');
  const [sku, setSku] = useState('');
  const [material, setMaterial] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  const fetchProducts = async () => {
    try {
      const prodRes = await api.get('/products?limit=100'); // Load bulk for admin
      setProducts(prodRes.data.data.products);
      
      const catRes = await api.get('/categories');
      setCategories(catRes.data.data);
      if (catRes.data.data.length > 0 && !categoryId) {
        setCategoryId(catRes.data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditProductId(null);
    setName('');
    setDescription('');
    setBrand('');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setGender('UNISEX');
    setPrice('');
    setDiscount('0');
    setStock('10');
    setSku('');
    setMaterial('');
    setSizes([]);
    setColors([]);
    setFeatured(false);
    setTrending(false);
    setNewArrival(false);
    setBestSeller(false);
    setImageFiles(null);
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditProductId(p.id);
    setName(p.name);
    setDescription(p.description);
    setBrand(p.brand);
    setCategoryId(p.categoryId);
    setGender(p.gender);
    setPrice(p.price.toString());
    setDiscount(p.discount.toString());
    setStock(p.stock.toString());
    setSku(p.sku);
    setMaterial(p.material || '');
    setSizes(p.sizes);
    setColors(p.colors);
    setFeatured(p.featured);
    setTrending(p.trending);
    setNewArrival(p.newArrival);
    setBestSeller(p.bestSeller);
    setImageFiles(null);
    setShowModal(true);
  };

  const handleSizeToggle = (size: string) => {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleColorToggle = (color: string) => {
    setColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const payload = {
        name,
        description,
        brand: brand || undefined,
        categoryId,
        gender,
        price: parseFloat(price),
        discount: parseFloat(discount) || 0,
        stock: parseInt(stock, 10),
        sku: sku || undefined,
        sizes,
        colors,
        material: material || undefined,
        featured,
        trending,
        newArrival,
        bestSeller
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          formData.append('images', imageFiles[i]);
        }
      }

      if (editProductId) {
        await api.put(`/products/${editProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Product updated successfully!');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Product created successfully!');
      }

      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error occurred while saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      alert('Product deleted!');
      fetchProducts();
    } catch (err: any) {
      alert('Failed to delete product');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-brand-dark">Product Management</h1>
          <p className="text-xs text-gray-400 font-semibold">Browse and modify catalog inventory stocks.</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="px-6 py-2.5 bg-brand-charcoal hover:bg-brand-gold text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          <Plus className="w-4.5 h-4.5" /> Add Product
        </button>
      </div>

      {/* Main product table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-gold" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-gray-500">
              <thead className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Final Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-brand-dark">
                {products.map((p) => {
                  const img = p.images?.find(i => i.isPrimary)?.url || p.images?.[0]?.url || 'https://via.placeholder.com/150';
                  return (
                    <tr key={p.id}>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-12 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="block font-bold text-brand-charcoal line-clamp-1">{p.name}</span>
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{p.category?.name || 'Catalog'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{p.brand}</td>
                      <td className="px-6 py-4 font-mono text-[10px] text-gray-400">{p.sku}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold ${p.stock > 0 ? 'text-green-600' : 'text-brand-red'}`}>
                          {p.stock} left
                        </span>
                      </td>
                      <td className="px-6 py-4">₹{Math.round(p.finalPrice)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => openEditModal(p)}
                            className="text-brand-gold hover:text-brand-goldHover p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="text-brand-red hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative">
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-base font-bold text-brand-dark uppercase tracking-wider border-b border-gray-100 pb-4">
              {editProductId ? 'Edit Product Catalog' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500">
              
              <div className="col-span-2 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Product Name</span>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Casual Slim-fit Cotton Shirt"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-medium"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Description</span>
                <textarea 
                  rows={3} required value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write product fabric specifications and washing instructions..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-medium"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Brand</span>
                <input 
                  type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ram Ji Collection"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-medium"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Category</span>
                <select 
                  value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none text-brand-dark cursor-pointer font-bold"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Gender</span>
                <select 
                  value={gender} onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none text-brand-dark cursor-pointer font-bold"
                >
                  <option value="MEN">MEN</option>
                  <option value="WOMEN">WOMEN</option>
                  <option value="UNISEX">UNISEX</option>
                  <option value="KIDS">KIDS</option>
                </select>
              </div>



              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Base Price (INR)</span>
                <input 
                  type="number" required value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="1299"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-medium"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Discount Percentage (%)</span>
                <input 
                  type="number" value={discount} onChange={(e) => setDiscount(e.target.value)}
                  placeholder="10"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-medium"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Inventory Stock Quantity</span>
                <input 
                  type="number" required value={stock} onChange={(e) => setStock(e.target.value)}
                  placeholder="25"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-medium"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Fabric Material</span>
                <input 
                  type="text" value={material} onChange={(e) => setMaterial(e.target.value)}
                  placeholder="100% Khadi Cotton"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-medium"
                />
              </div>

              {/* Sizes checklist */}
              <div className="col-span-2 space-y-1.5 border-t border-gray-100 pt-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Available Sizes</span>
                <div className="flex gap-4">
                  {SIZES_LIST.map((size) => (
                    <label key={size} className="flex items-center gap-1.5 cursor-pointer text-brand-dark">
                      <input 
                        type="checkbox" checked={sizes.includes(size)} onChange={() => handleSizeToggle(size)}
                        className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors checklist */}
              <div className="col-span-2 space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Available Colors</span>
                <div className="flex flex-wrap gap-4">
                  {COLORS_LIST.map((color) => (
                    <label key={color} className="flex items-center gap-1.5 cursor-pointer text-brand-dark">
                      <input 
                        type="checkbox" checked={colors.includes(color)} onChange={() => handleColorToggle(color)}
                        className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                      />
                      {color}
                    </label>
                  ))}
                </div>
              </div>

              {/* Flags checks */}
              <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-100 pt-4 text-brand-dark">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded text-brand-gold focus:ring-brand-gold" />
                  Featured Product
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={trending} onChange={(e) => setTrending(e.target.checked)} className="rounded text-brand-gold focus:ring-brand-gold" />
                  Trending Product
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} className="rounded text-brand-gold focus:ring-brand-gold" />
                  New Arrival
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={bestSeller} onChange={(e) => setBestSeller(e.target.checked)} className="rounded text-brand-gold focus:ring-brand-gold" />
                  Best Seller
                </label>
              </div>

              {/* Upload Images */}
              <div className="col-span-2 space-y-1 border-t border-gray-100 pt-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Product Images (Upload)</span>
                <input 
                  type="file" multiple accept="image/*"
                  onChange={(e) => setImageFiles(e.target.files)}
                  className="w-full text-xs font-semibold text-gray-500 cursor-pointer file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-brand-gold hover:file:bg-orange-100"
                />
              </div>

              <div className="col-span-2 pt-4 flex gap-4">
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-brand-charcoal text-white font-bold tracking-widest text-[10px] uppercase rounded-full hover:bg-brand-gold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving changes...' : 'Save Product'}
                </button>
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="px-8 py-3 border border-gray-200 text-gray-500 font-bold tracking-widest text-[10px] uppercase rounded-full hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
