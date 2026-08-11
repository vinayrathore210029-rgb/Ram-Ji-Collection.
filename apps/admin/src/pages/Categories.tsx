import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Category } from '@ramjicollection/types';
import { Plus, Trash2, Edit, X, FolderOpen, Image as ImageIcon } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditCategory(null);
    setName('');
    setSlug('');
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setImageFile(null);
    setImagePreview(cat.imageUrl || null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify({ name, slug }));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editCategory) {
        await api.put(`/categories/${editCategory.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Category updated successfully!');
      } else {
        await api.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Category created successfully!');
      }

      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All associated products will be deleted too!')) return;
    try {
      await api.delete(`/categories/${id}`);
      alert('Category deleted!');
      fetchCategories();
    } catch (err: any) {
      alert('Failed to delete category');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-wider text-brand-dark flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-brand-gold" /> Saree Category Management
          </h1>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">
            Organize saree styles, fabrics, and collection categories.
          </p>
        </div>
        
        <button
          onClick={openAddModal}
          className="px-6 py-2.5 bg-brand-charcoal hover:bg-brand-gold text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          <Plus className="w-4.5 h-4.5" /> Add Saree Category
        </button>
      </div>

      {/* Main Categories Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-gold" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-sm font-bold text-gray-500">No categories found.</p>
            <button
              onClick={openAddModal}
              className="px-5 py-2 bg-brand-gold text-white font-bold text-xs rounded-xl"
            >
              Add First Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-gray-500">
              <thead className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">URL Slug</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-brand-dark">
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="px-6 py-4">
                      <div className="w-12 h-14 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                        <img 
                          src={cat.imageUrl || 'https://via.placeholder.com/150'} 
                          alt={cat.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-brand-charcoal text-sm">{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 text-amber-800 font-mono text-xs">
                      /{cat.slug}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => openEditModal(cat)}
                          className="text-brand-gold hover:text-brand-goldHover p-1"
                          title="Edit Category & Photo"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="text-brand-red hover:text-red-700 p-1"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6 relative">
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-base font-extrabold text-brand-dark uppercase tracking-wider border-b border-gray-100 pb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-brand-gold" />
              {editCategory ? 'Edit Saree Category' : 'Add New Saree Category'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-gray-600">
              
              {/* Category Name */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Category Name</span>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => { 
                    setName(e.target.value); 
                    if (!editCategory) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')); 
                  }}
                  placeholder="E.g. Tissue Silk Sarees"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-gold text-brand-dark font-semibold"
                />
              </div>
              
              {/* Slug */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">URL Slug</span>
                <input 
                  type="text" 
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="e.g. tissue-silk-sarees"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-gold text-brand-dark font-mono"
                />
              </div>

              {/* Photo Image Section */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">
                  Category Photo Image
                </span>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="flex items-center gap-3 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                    <div className="w-14 h-16 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-900 font-extrabold block">Current / Selected Photo</span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">Select a new file below to replace this photo.</span>
                    </div>
                  </div>
                )}

                {/* Upload File Input */}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                    if (file) {
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs font-semibold text-gray-500 cursor-pointer file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                />
                <span className="text-[10px] text-gray-400 block">
                  Upload JPG, PNG, WEBP photo for category banner/card display.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-extrabold tracking-widest text-xs uppercase rounded-full hover:from-amber-700 hover:to-amber-800 shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editCategory ? 'Update Category Photo & Info' : 'Create Saree Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-500 font-bold tracking-widest text-xs uppercase rounded-full hover:bg-gray-100 transition-colors"
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
