import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Category } from '@ramjicollection/types';
import { FolderOpen, Plus, Trash2, Edit } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit states
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify({ name, slug }));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Category created!');
      setName('');
      setSlug('');
      setImageFile(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await api.put(`/categories/${id}`, { name: editName, slug: editSlug });
      alert('Category updated!');
      setEditId(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update category');
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
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-brand-dark">Category Management</h1>
        <p className="text-xs text-gray-400 font-semibold">Organize catalog navigation departments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form: Add category */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm h-fit space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-dark flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-gold" /> Add Category
          </h3>
          
          <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold text-gray-500">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Category Name</span>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')); }}
                placeholder="E.g. Casual Shirts"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-medium"
              />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Slug (URL friendly)</span>
              <input 
                type="text" 
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="e.g. casual-shirts"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-gold text-brand-dark font-medium"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Category Image</span>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-xs font-medium text-gray-500 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-brand-gold hover:file:bg-orange-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-brand-charcoal text-white font-bold tracking-widest text-[10px] uppercase rounded-lg hover:bg-brand-gold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Right table list */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-gold" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-gray-500">
                <thead className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-brand-dark">
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                          <img 
                            src={cat.imageUrl || 'https://via.placeholder.com/150'} 
                            alt=""
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editId === cat.id ? (
                          <input 
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded p-1 font-semibold text-xs outline-none"
                          />
                        ) : (
                          <span>{cat.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {editId === cat.id ? (
                          <input 
                            type="text"
                            value={editSlug}
                            onChange={(e) => setEditSlug(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded p-1 font-semibold text-xs outline-none"
                          />
                        ) : (
                          <span>/{cat.slug}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          {editId === cat.id ? (
                            <>
                              <button 
                                onClick={() => handleUpdate(cat.id)}
                                className="text-green-600 hover:underline"
                              >
                                Save
                              </button>
                              <button 
                                onClick={() => setEditId(null)}
                                className="text-gray-400 hover:underline"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditSlug(cat.slug); }}
                                className="text-brand-gold hover:text-brand-goldHover p-1"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(cat.id)}
                                className="text-brand-red hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
