import { create } from 'zustand';
import api from '../services/api';
import { User, CartItem, WishlistItem, Product } from '@ramjicollection/types';

// ==========================================
// 1. Auth Store
// ==========================================
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Listen for logout events dispatched by Axios interceptor on token expiry
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-logout', () => {
      set({ user: null, token: null });
    });
  }

  return {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,

    login: async (credentials) => {
      set({ loading: true });
      try {
        const response = await api.post('/auth/login', credentials);
        const { token, refreshToken, user } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        set({ token, user, loading: false });
      } catch (error: any) {
        set({ loading: false });
        throw error.response?.data?.message || 'Login failed';
      }
    },

    register: async (data) => {
      set({ loading: true });
      try {
        const response = await api.post('/auth/register', data);
        const { token, refreshToken, user } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        set({ token, user, loading: false });
      } catch (error: any) {
        set({ loading: false });
        throw error.response?.data?.message || 'Registration failed';
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ user: null, token: null });
    },

    checkAuth: async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      set({ loading: true });
      try {
        const response = await api.get('/auth/me');
        set({ user: response.data.data, loading: false });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, token: null, loading: false });
      }
    }
  };
});

// ==========================================
// 2. Cart Store
// ==========================================
interface CartState {
  items: CartItem[];
  loading: boolean;
  totalItems: number;
  totalPrice: number;
  fetchCart: () => Promise<void>;
  addItem: (item: { productId: string; quantity: number; size: string; color: string }) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => {
  const calculateTotals = (items: CartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.product?.finalPrice || 0) * item.quantity, 0);
    return { totalItems, totalPrice };
  };

  return {
    items: [],
    loading: false,
    totalItems: 0,
    totalPrice: 0,

    fetchCart: async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      set({ loading: true });
      try {
        const response = await api.get('/cart');
        const items = response.data.data;
        const { totalItems, totalPrice } = calculateTotals(items);
        set({ items, totalItems, totalPrice, loading: false });
      } catch (error) {
        set({ loading: false });
      }
    },

    addItem: async (item) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login to add items to cart');

      try {
        await api.post('/cart', item);
        await get().fetchCart();
      } catch (error: any) {
        throw error.response?.data?.message || 'Failed to add item to cart';
      }
    },

    updateQuantity: async (id, quantity) => {
      try {
        await api.put(`/cart/${id}`, { quantity });
        await get().fetchCart();
      } catch (error: any) {
        throw error.response?.data?.message || 'Failed to update quantity';
      }
    },

    removeItem: async (id) => {
      try {
        await api.delete(`/cart/${id}`);
        await get().fetchCart();
      } catch (error: any) {
        throw error.response?.data?.message || 'Failed to remove item';
      }
    },

    clearCart: async () => {
      try {
        await api.delete('/cart');
        set({ items: [], totalItems: 0, totalPrice: 0 });
      } catch (error: any) {
        throw error.response?.data?.message || 'Failed to clear cart';
      }
    }
  };
});

// ==========================================
// 3. Wishlist Store
// ==========================================
interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => {
  return {
    items: [],
    loading: false,

    fetchWishlist: async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      set({ loading: true });
      try {
        const response = await api.get('/wishlist');
        set({ items: response.data.data, loading: false });
      } catch (error) {
        set({ loading: false });
      }
    },

    toggleWishlist: async (product) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login to manage your wishlist');

      const isFav = get().isInWishlist(product.id);
      try {
        if (isFav) {
          await api.delete(`/wishlist/${product.id}`);
          set({
            items: get().items.filter(item => item.productId !== product.id)
          });
        } else {
          const response = await api.post('/wishlist', { productId: product.id });
          set({
            items: [...get().items, response.data.data]
          });
        }
      } catch (error: any) {
        throw error.response?.data?.message || 'Wishlist operation failed';
      }
    },

    isInWishlist: (productId) => {
      return get().items.some(item => item.productId === productId);
    }
  };
});
