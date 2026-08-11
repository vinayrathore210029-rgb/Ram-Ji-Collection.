import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Product, Category } from '@ramjicollection/types';
import { Plus, Trash2, Edit, X } from 'lucide-react';

const BLOUSE_OPTIONS = [
  'Unstitched Blouse (0.8m)',
  'With Matching Blouse',
  'Stitched Readymade Blouse',
  'Custom Tailoring Available'
];

const SAREE_COLORS = [
  { name: 'Red', hex: '#DC2626' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Crimson', hex: '#990000' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Mustard Yellow', hex: '#D97706' },
  { name: 'Royal Blue', hex: '#1D4ED8' },
  { name: 'Emerald Green', hex: '#047857' },
  { name: 'Golden', hex: '#EAB308' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Purple', hex: '#7E22CE' },
  { name: 'Pastel', hex: '#F472B6' },
  { name: 'Cream / White', hex: '#F5F5F4' }
];

const SAREE_STYLES = ['Banarasi', 'Bandhani', 'Organza', 'Kanjeevaram', 'Leheriya', 'Patola', 'Designer'];
const FABRIC_MATERIALS = ['Pure Silk', 'Georgette', 'Chiffon', 'Organza', 'Gaji Silk', 'Chanderi Cotton'];
const WORK_TYPES = ['Gota Patti', 'Zardosi', 'Mirror Work', 'Sequins', 'Handwork', 'Printed'];
const OCCASIONS = ['Bridal / Wedding', 'Party Wear', 'Haldi / Mehendi', 'Festive & Pooja'];

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
  const [brand, setBrand] = useState('Ram Ji Collection');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [stock, setStock] = useState('10');
  const [sku, setSku] = useState('');
  
  // Saree Specs
  const [sareeStyle, setSareeStyle] = useState(SAREE_STYLES[0]);
  const [fabric, setFabric] = useState(FABRIC_MATERIALS[0]);
  const [workType, setWorkType] = useState(WORK_TYPES[0]);
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [sareeLength, setSareeLength] = useState('5.5 Meters Saree + 0.8 Meter Blouse');
  const [blouseDetails, setBlouseDetails] = useState('Unstitched 0.8 meter matching silk blouse piece');
  const [careInstructions, setCareInstructions] = useState('Dry Clean Only');

  // Options
  const [sizes, setSizes] = useState<string[]>([BLOUSE_OPTIONS[0]]);
  const [colors, setColors] = useState<string[]>(['Red', 'Golden']);
  
  // Badges
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string; isPrimary: boolean }[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const prodRes = await api.get('/products?limit=100');
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
    setBrand('Ram Ji Collection');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setPrice('');
    setDiscount('0');
    setStock('10');
    setSku('');
    
    setSareeStyle(SAREE_STYLES[0]);
    setFabric(FABRIC_MATERIALS[0]);
    setWorkType(WORK_TYPES[0]);
    setOccasion(OCCASIONS[0]);
    setSareeLength('5.5 Meters Saree + 0.8 Meter Blouse');
    setBlouseDetails('Unstitched 0.8 meter matching silk blouse piece');
    setCareInstructions('Dry Clean Only');

    setSizes([BLOUSE_OPTIONS[0]]);
    setColors(['Red', 'Golden']);
    
    setFeatured(false);
    setTrending(false);
    setNewArrival(false);
    setBestSeller(false);
    setImageFiles(null);
    setExistingImages([]);
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditProductId(p.id);
    setName(p.name);
    setDescription(p.description);
    setBrand(p.brand || 'Ram Ji Collection');
    setCategoryId(p.categoryId);
    setPrice(p.price.toString());
    setDiscount(p.discount.toString());
    setStock(p.stock.toString());
    setSku(p.sku);
    
    setSareeStyle(p.sareeStyle || SAREE_STYLES[0]);
    setFabric(p.fabric || FABRIC_MATERIALS[0]);
    setWorkType(p.workType || WORK_TYPES[0]);
    setOccasion(p.occasion || OCCASIONS[0]);
    setSareeLength(p.sareeLength || '5.5 Meters Saree + 0.8 Meter Blouse');
    setBlouseDetails(p.blouseDetails || 'Unstitched 0.8 meter matching silk blouse piece');
    setCareInstructions(p.careInstructions || 'Dry Clean Only');

    setSizes(p.sizes && p.sizes.length > 0 ? p.sizes : [BLOUSE_OPTIONS[0]]);
    setColors(p.colors && p.colors.length > 0 ? p.colors : ['Red']);
    
    setFeatured(p.featured);
    setTrending(p.trending);
    setNewArrival(p.newArrival);
    setBestSeller(p.bestSeller);
    setImageFiles(null);
    setExistingImages(p.images || []);
    setShowModal(true);
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    setDeletingImageId(imageId);
    try {
      await api.delete(`/products/images/${imageId}`);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete image');
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleBlouseOptionToggle = (option: string) => {
    setSizes(prev => prev.includes(option) ? prev.filter(s => s !== option) : [...prev, option]);
  };

  const handleColorToggle = (colorName: string) => {
    setColors(prev => prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const payload = {
        name,
        description,
        brand: brand || 'Ram Ji Collection',
        categoryId,
        price: parseFloat(price),
        discount: parseFloat(discount) || 0,
        stock: parseInt(stock, 10),
        sku: sku || undefined,
        sizes,
        colors,
        material: fabric,
        fabric: fabric || undefined,
        workType: workType || undefined,
        occasion: occasion || undefined,
        sareeStyle: sareeStyle || undefined,
        blouseDetails: blouseDetails || undefined,
        sareeLength: sareeLength || undefined,
        careInstructions: careInstructions || undefined,
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
        alert('Saree updated successfully!');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Saree created successfully!');
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
    if (!confirm('Are you sure you want to delete this saree from catalog?')) return;
    try {
      await api.delete(`/products/${id}`);
      alert('Saree deleted!');
      fetchProducts();
    } catch (err: any) {
      alert('Failed to delete saree');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-wider text-brand-dark">Saree Catalog Management</h1>
          <p className="text-xs text-gray-400 font-semibold">Manage exclusive sarees, fabrics, work types, and stock inventory.</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="px-6 py-2.5 bg-brand-charcoal hover:bg-brand-gold text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          <Plus className="w-4.5 h-4.5" /> Add New Saree
        </button>
      </div>

      {/* Main Saree Product Table */}
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
                  <th className="px-6 py-4">Saree Detail</th>
                  <th className="px-6 py-4">Style & Fabric</th>
                  <th className="px-6 py-4">Work / Craft</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-brand-dark">
                {products.map((p) => {
                  const img = p.images?.find(i => i.isPrimary)?.url || p.images?.[0]?.url || 'https://via.placeholder.com/150';
                  return (
                    <tr key={p.id}>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-12 h-16 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="block font-bold text-brand-charcoal line-clamp-1">{p.name}</span>
                          <span className="text-[10px] text-amber-700 font-extrabold block mt-0.5">{p.category?.name || 'Saree'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="block text-brand-dark font-bold">{p.sareeStyle || 'Traditional'}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{p.fabric || p.material || 'Silk'}</span>
                      </td>
                      <td className="px-6 py-4 text-rose-900 font-bold">{p.workType || 'Handwork'}</td>
                      <td className="px-6 py-4 font-mono text-[10px] text-gray-400">{p.sku}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold ${p.stock > 0 ? 'text-green-600' : 'text-brand-red'}`}>
                          {p.stock} pcs
                        </span>
                      </td>
                      <td className="px-6 py-4">₹{Math.round(p.finalPrice)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => openEditModal(p)}
                            className="text-brand-gold hover:text-brand-goldHover p-1"
                            title="Edit Saree"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="text-brand-red hover:text-red-700 p-1"
                            title="Delete Saree"
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

      {/* Structured Saree Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative">
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-base font-extrabold text-brand-dark uppercase tracking-wider border-b border-gray-100 pb-4 flex items-center gap-2">
              <span className="text-brand-gold">🥻</span> {editProductId ? 'Edit Saree Details' : 'Add New Saree to Catalog'}
            </h3>

            <form onSubmit={handleSave} className="space-y-6 text-xs font-semibold text-gray-600">
              
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="space-y-3 bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                <h4 className="text-[11px] font-extrabold text-amber-900 uppercase tracking-widest border-b border-amber-100 pb-1.5">
                  1. Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Saree Title / Product Name</span>
                    <input 
                      type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="E.g. Royal Red Pure Silk Banarasi Saree"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-semibold"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Product Description</span>
                    <textarea 
                      rows={3} required value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write saree details, zari motifs, weaves, and drape description..."
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Brand / Collection Name</span>
                    <input 
                      type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                      placeholder="Ram Ji Collection"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Category</span>
                    <select 
                      value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none text-brand-dark cursor-pointer font-bold"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRICING & INVENTORY */}
              <div className="space-y-3 bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                <h4 className="text-[11px] font-extrabold text-amber-900 uppercase tracking-widest border-b border-amber-100 pb-1.5">
                  2. Pricing & Inventory
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Base Price (INR ₹)</span>
                    <input 
                      type="number" required value={price} onChange={(e) => setPrice(e.target.value)}
                      placeholder="7999"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Discount (%)</span>
                    <input 
                      type="number" value={discount} onChange={(e) => setDiscount(e.target.value)}
                      placeholder="15"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Stock Quantity (Pcs)</span>
                    <input 
                      type="number" required value={stock} onChange={(e) => setStock(e.target.value)}
                      placeholder="10"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">SKU (Auto/Custom)</span>
                    <input 
                      type="text" value={sku} onChange={(e) => setSku(e.target.value)}
                      placeholder="RJC-BAN-001"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: SAREE SPECIFICATIONS */}
              <div className="space-y-3 bg-amber-50/40 p-4 rounded-2xl border border-amber-100">
                <h4 className="text-[11px] font-extrabold text-amber-900 uppercase tracking-widest border-b border-amber-200 pb-1.5">
                  3. Saree Specifications
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Saree Style</span>
                    <select 
                      value={sareeStyle} onChange={(e) => setSareeStyle(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none text-brand-dark font-bold cursor-pointer"
                    >
                      {SAREE_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Fabric Material</span>
                    <select 
                      value={fabric} onChange={(e) => setFabric(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none text-brand-dark font-bold cursor-pointer"
                    >
                      {FABRIC_MATERIALS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Work / Craft</span>
                    <select 
                      value={workType} onChange={(e) => setWorkType(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none text-brand-dark font-bold cursor-pointer"
                    >
                      {WORK_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Occasion</span>
                    <select 
                      value={occasion} onChange={(e) => setOccasion(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none text-brand-dark font-bold cursor-pointer"
                    >
                      {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Saree Length</span>
                    <input 
                      type="text" value={sareeLength} onChange={(e) => setSareeLength(e.target.value)}
                      placeholder="5.5 Meters Saree + 0.8 Meter Blouse"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Blouse Piece Details</span>
                    <input 
                      type="text" value={blouseDetails} onChange={(e) => setBlouseDetails(e.target.value)}
                      placeholder="Unstitched 0.8 meter matching silk blouse piece"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-semibold"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Care Instructions</span>
                    <input 
                      type="text" value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)}
                      placeholder="Dry Clean Only"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: BLOUSE & STITCHING OPTIONS */}
              <div className="space-y-2 bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-widest block border-b border-gray-200 pb-1.5">
                  4. Available Blouse / Stitching Options
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {BLOUSE_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-gray-200 hover:border-brand-gold text-brand-dark font-semibold">
                      <input 
                        type="checkbox" checked={sizes.includes(opt)} onChange={() => handleBlouseOptionToggle(opt)}
                        className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION 5: SAREE COLORS */}
              <div className="space-y-2 bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-widest block border-b border-gray-200 pb-1.5">
                  5. Saree Color Swatches
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {SAREE_COLORS.map((c) => (
                    <label key={c.name} className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-xl border border-gray-200 hover:border-brand-gold text-brand-dark font-semibold text-xs">
                      <input 
                        type="checkbox" checked={colors.includes(c.name)} onChange={() => handleColorToggle(c.name)}
                        className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                      />
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-sm flex-shrink-0" style={{ backgroundColor: c.hex }} />
                      <span className="truncate">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION 6: MEDIA & BADGES */}
              <div className="space-y-4 bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                <h4 className="text-[11px] font-extrabold text-amber-900 uppercase tracking-widest border-b border-gray-200 pb-1.5">
                  6. Media & Display Badges
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-brand-dark">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded text-brand-gold focus:ring-brand-gold" />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={trending} onChange={(e) => setTrending(e.target.checked)} className="rounded text-brand-gold focus:ring-brand-gold" />
                    Trending
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

                {/* Unlimited Upload Images */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">
                      Product Photos (Upload Unlimited Saree Images)
                    </span>
                    <span className="text-[10px] font-bold text-amber-700">
                      {existingImages.length} Uploaded
                    </span>
                  </div>

                  {existingImages.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map((img, idx) => (
                        <div key={img.id} className="relative group w-20 h-24 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                          <img src={img.url} alt={`Saree ${idx + 1}`} className="w-full h-full object-cover" />
                          {img.isPrimary && (
                            <span className="absolute top-1 left-1 bg-brand-gold text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                              Main
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            disabled={deletingImageId === img.id}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition-transform hover:scale-110 disabled:opacity-50"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1">
                    <input 
                      type="file" multiple accept="image/*"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files) return;
                        setImageFiles(files);
                      }}
                      className="w-full text-xs font-semibold text-gray-500 cursor-pointer file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                    />
                    <span className="text-[10px] text-gray-400 block">
                      Select as many photos as you want (Unlimited uploads). JPG, PNG, WEBP supported.
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 flex gap-4">
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-extrabold tracking-widest text-xs uppercase rounded-full hover:from-amber-700 hover:to-amber-800 shadow-lg transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving Saree...' : 'Save Saree Product'}
                </button>
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="px-8 py-3.5 border border-gray-200 text-gray-500 font-bold tracking-widest text-xs uppercase rounded-full hover:bg-gray-100 transition-colors"
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
