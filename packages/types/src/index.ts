export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  createdAt: Date;
}

export type ProductGender = 'MEN' | 'WOMEN' | 'UNISEX' | 'KIDS';

export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  categoryId: string;
  gender: ProductGender;
  price: number;
  discount: number; // In percentage, e.g., 10 for 10%
  finalPrice: number;
  stock: number;
  sku: string;
  sizes: string[]; // E.g., ['S', 'M', 'L', 'XL']
  colors: string[]; // E.g., ['Red', 'Black', 'Blue']
  material: string | null;
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  images?: ProductImage[];
  category?: Category;
  reviews?: Review[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  payableAmount: number;
  couponCode: string | null;
  shippingAddressId: string;
  billingAddressId: string;
  paymentStatus: PaymentStatus;
  paymentId: string | null;
  orderIdRazorpay: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  user?: User;
  shippingAddress?: Address;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  product?: Product;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user?: User;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  expiryDate: Date;
  minPurchaseAmount: number;
}

export interface Address {
  id: string;
  userId: string;
  type: string; // 'HOME' | 'WORK' | 'OTHER'
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  active: boolean;
  type: 'HERO' | 'PROMO';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
