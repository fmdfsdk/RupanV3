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
  userId?: string;
  transactionId?: string;
  paidConfirm?: boolean;
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
  id?: any;
  homepageConfig?: any;
  metaPixelId?: string;
  metaTestEventCode?: string;
  metaCapiAccessToken?: string;
  googleTagManagerId?: string;
  googleAnalyticsId?: string;
  // Payment Gateway Configurations
  paymentBanglaQrEnabled: boolean;
  paymentBkashEnabled: boolean;
  paymentNagadEnabled: boolean;
  paymentCodEnabled: boolean;
  paymentBkashNumber: string;
  paymentNagadNumber: string;
  paymentBanglaQrImage: string;
  paymentBanglaQrInstruction: string;
  paymentMfsInstruction: string;
  paymentCodInstruction: string;
  // Social Media Configurations
  socialFacebook?: string;
  socialTwitter?: string;
  socialYoutube?: string;
  socialInstagram?: string;
  // Telegram Bot Backup Integration
  telegramBotToken?: string;
  telegram_bot_token?: string;
  telegramChatId?: string;
  telegram_chat_id?: string;
  telegramNotificationsEnabled?: boolean;
  telegram_notifications_enabled?: boolean;
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productName: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
  image?: string;
  createdAt: string;
}
