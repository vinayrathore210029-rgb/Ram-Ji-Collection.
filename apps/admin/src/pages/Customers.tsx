import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { User } from '@ramjicollection/types';
import { Users } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/admin/customers');
        setCustomers(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-brand-dark">Customer Base</h1>
        <p className="text-xs text-gray-400 font-semibold">View registered e-commerce customer accounts.</p>
      </div>

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
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-brand-dark">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 font-bold text-brand-charcoal">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-500">{c.email}</td>
                    <td className="px-6 py-4 text-gray-400">{c.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
