/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VariantOption {
  value: string;
  extraPrice: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  mandatory: boolean;
  options: VariantOption[];
}

export type VariantStock = Record<string, Record<string, { qty: number; active: boolean }>>;
export type VariantImages = Record<string, Record<string, string>>;

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
  length?: number;
  width?: number;
  height?: number;
  unitName?: string;
  unit_name?: string;
  initialSold?: number;
  initial_sold?: number;
  detailsList?: { type: string; description: string }[];
  details_list?: { type: string; description: string }[];
  shippingOption?: 'default' | 'custom';
  insideDhakaShipping?: number;
  outsideDhakaShipping?: number;
  condition?: 'New' | 'Used' | 'Refurbished';
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
  purchasePrice?: number;
  purchase_price?: number;
  finalPrice?: number;
  final_price?: number;
  sourceProductId?: string;
  source_product_id?: string;
  // Variants overhaul
  variants?: ProductVariant[];
  variant_stock?: VariantStock;
  variantStock?: VariantStock;
  variant_images?: VariantImages;
  variantImages?: VariantImages;
  maintain_variant_stock?: boolean;
  maintainVariantStock?: boolean;
}

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  selectedVariants?: Record<string, string>;
  extraPrice?: number;
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
  division?: string;
  district?: string;
  onlinePaymentDiscount?: number;
  couponDiscount?: number;
  finalPriceFloor?: number;
  paymentScreenshotUrl?: string;
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
  isRecommended?: boolean;
  is_recommended?: boolean;
  isAutoApply?: boolean;
  is_auto_apply?: boolean;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  ctaText?: string;
  category?: string;
  isActive: boolean;
  type: 'homepage' | 'category' | 'popup' | 'flash_sale';
  publishDate?: string;
  overlayOpacity?: number;
  overlay_opacity?: number;
}

export interface PricingConfig {
  deduction_percentage: number;
  default_margin_type: 'percentage' | 'fixed';
  default_margin_value: number;
  category_margins?: Record<string, { type: 'percentage' | 'fixed'; value: number } | number>;
  discount_combination_rule?: 'stack' | 'max';
  online_payment_discount_type?: 'margin_percentage' | 'selling_percentage' | 'fixed';
  online_payment_discount_value?: number;
  minimum_price_protection_enabled?: boolean;
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
  freeShippingEnabled?: boolean;
  theme: string;
  id?: any;
  homepageConfig?: any;
  pricingConfig?: PricingConfig;
  pricing_config?: PricingConfig;
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
  paymentScreenshotEnabled?: boolean;
  payment_screenshot_enabled?: boolean;
  onlinePaymentDiscountEnabled?: boolean;
  onlinePaymentDiscountPercent?: number;
  // Social Media Configurations
  socialFacebook?: string;
  socialTwitter?: string;
  socialYoutube?: string;
  socialInstagram?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
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
  image?: string | null;
  banner_image?: string | null;
  bannerImage?: string | null;
  description?: string | null;
  short_description?: string | null;
  shortDescription?: string | null;
  parent_id?: string | null;
  parentId?: string | null;
  sort_order?: number;
  sortOrder?: number;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
  productCount?: number;
  subcategories_count?: number;
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
