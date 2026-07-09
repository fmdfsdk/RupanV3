/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  slug?: string;
  sku?: string;
  brand?: string;
  category: string;
  subCategory?: string;
  tags?: string[];
  gender: 'Men' | 'Women' | 'Couple' | 'Kids' | 'Accessories';
  price: number;
  discountPrice?: number;
  rating: number;
  reviewsCount: number;
  images: string[]; // At least 2 images for hover action
  colors: { name: string; class: string; hex: string }[];
  sizes: string[];
  description: string;
  shortDescription?: string;
  features: string[];
  stock: number;
  lowStockWarning?: number;
  weight?: number;
  material?: string;
  status?: 'published' | 'draft' | 'archived';
  isFeatured?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFlashSale?: boolean;
  flashSaleLimit?: number;
  flashSaleSold?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  userPhoto?: string;
  productId?: string;
  status?: 'approved' | 'pending' | 'rejected';
  reply?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  area: string; // Inside Dhaka or Outside Dhaka for shipping fee
  paymentMethod: string;
  items: {
    productId: string;
    productName: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
  createdAt: string;
  customerNotes?: string;
  adminNotes?: string;
  paymentStatus?: 'Unpaid' | 'Paid' | 'Refunded';
  isGuest?: boolean;
  isIncognitoGuest?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  readTime: string;
  category?: string;
  status?: 'draft' | 'published';
  seoTitle?: string;
  seoDescription?: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  category?: string;
  isActive: boolean;
  type: 'homepage' | 'category' | 'popup' | 'flash_sale';
  publishDate?: string;
}

export interface WebsiteSettings {
  logoText: string;
  logoAccent: string;
  tagline: string;
  whatsappNumber: string;
  supportNumber: string;
  currencySymbol: string;
  insideDhakaShipping: number;
  outsideDhakaShipping: number;
  freeShippingMinOrder: number;
  theme: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Editor' | 'Support' | 'Delivery Manager' | 'Customer';
  isActive: boolean;
  totalSpending: number;
  lastLogin?: string;
  createdAt: string;
}
