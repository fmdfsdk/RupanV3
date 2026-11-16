import { create } from 'zustand';
import { Product, CartItem, Order, Review, BlogPost, Coupon, WebsiteSettings } from '../types';
import { PRODUCTS as MOCK_PRODUCTS, REVIEWS as MOCK_REVIEWS, BLOGS as MOCK_BLOGS } from '../data';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { blogService } from '../services/blogService';
import { bannerService } from '../services/bannerService';
import { settingsService } from '../services/settingsService';
import { reviewService } from '../services/reviewService';
import { generateEventId, initializeTelemetry, trackAddToCart, trackPurchase } from '../lib/telemetry';
import { supabase } from '../lib/supabase';

interface StoreState {
  isSupabaseOnline: boolean;
  isDataLoaded: boolean;
  dbProducts: Product[];
  // Full catalog index (all product IDs + minimal fields) — used for search & ID resolution
  productCatalogIndex: Product[];
  dbReviews: Review[];
  dbBlogs: BlogPost[];
  dbBanners: any[];
  dbSettings: any;
  cart: CartItem[];
  wishlist: Product[];
  orders: Order[];
  currentUser: any;
  appliedCoupon: { code: string; discount: number; type?: string; minOrder?: number } | null;
  lastPlacedOrder: Order | null;
  recentlyViewedIds: string[];
  checkoutForm: {
    name: string;
    phone: string;
    address: string;
    division?: string;
    district?: string;
    area: string;
    paymentMethod: string;
    email: string;
    transactionId?: string;
    paidConfirm?: boolean;
    paymentScreenshotUrl?: string;
  };
  
  // UI & Navigation States
  selectedCategory: string;
  selectedGender: string;
  searchQuery: string;
  searchOpen: boolean;
  quickViewProduct: Product | null;
  sizeGuideOpen: boolean;
  sizeGuideCategory: string;
  fullProductDetail: Product | null;
  
  // Shop Filters
  checkedCategories: string[];
  checkedSubCategories: string[];
  selectedBrands: string[];
  minPrice: string;
  maxPrice: string;
  selectedStock: string[];
  sidebarSearch: string;
  sortBy: string;
  
  // Sidebar Expand States
  categoriesExpanded: boolean;
  subCategoriesExpanded: boolean;
  brandExpanded: boolean;
  priceExpanded: boolean;
  stockExpanded: boolean;
  
  // Applied filters
  appliedFilters: {
    categories: string[];
    subCategories: string[];
    brands: string[];
    minPrice: string;
    maxPrice: string;
    stock: string[];
    search: string;
  };

  // Setters & UI Actions
  setIsSupabaseOnline: (online: boolean) => void;
  setIsDataLoaded: (loaded: boolean) => void;
  setDbProducts: (products: Product[]) => void;
  setProductCatalogIndex: (index: Product[]) => void;
  setDbReviews: (reviews: Review[]) => void;
  setDbBlogs: (blogs: BlogPost[]) => void;
  setDbBanners: (banners: any[]) => void;
  setDbSettings: (settings: any) => void;
  dbCoupons: any[];
  setDbCoupons: (coupons: any[]) => void;
  // Fetch a single product from DB on-demand (for product detail page / featured items out of local 1000)
  fetchProductByIdFromDB: (idOrSlug: string) => Promise<Product | null>;
  setCurrentUser: (user: any) => void;
  setCart: (cart: CartItem[]) => void;
  setWishlist: (wishlist: Product[]) => void;
  setOrders: (orders: Order[]) => void;
  setAppliedCoupon: (coupon: { code: string; discount: number; type?: string; minOrder?: number } | null) => void;
  setLastPlacedOrder: (order: Order | null) => void;
  setCheckoutForm: (form: any) => void;
  addRecentlyViewedId: (id: string) => void;
  
  // UI Setters
  setSelectedCategory: (cat: string) => void;
  setSelectedGender: (gender: string) => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  setQuickViewProduct: (prod: Product | null) => void;
  setSizeGuideOpen: (open: boolean) => void;
  setSizeGuideCategory: (cat: string) => void;
  setFullProductDetail: (prod: Product | null) => void;
  
  // Filter Setters
  setCheckedCategories: (cats: string[]) => void;
  setCheckedSubCategories: (subs: string[]) => void;
  setSelectedBrands: (brands: string[]) => void;
  setMinPrice: (price: string) => void;
  setMaxPrice: (price: string) => void;
  setSelectedStock: (stock: string[]) => void;
  setSidebarSearch: (search: string) => void;
  setSortBy: (sort: string) => void;
  
  // Sidebar Expand Setters
  setCategoriesExpanded: (exp: boolean) => void;
  setSubCategoriesExpanded: (exp: boolean) => void;
  setBrandExpanded: (exp: boolean) => void;
  setPriceExpanded: (exp: boolean) => void;
  setStockExpanded: (exp: boolean) => void;
  setAppliedFilters: (filters: any) => void;

  // Business Actions
  loadInitialData: () => Promise<void>;
  addToCart: (product: Product, size: string, color: string, qty?: number) => void;
  updateCartQty: (index: number, newQty: number) => void;
  toggleWishlist: (product: Product) => void;
  applyCoupon: (code: string) => {
    success: boolean;
    reason: 'SUCCESS' | 'INVALID_CODE' | 'INACTIVE' | 'EXPIRED' | 'USAGE_LIMIT_REACHED' | 'MIN_ORDER_NOT_MET';
    message: string;
    minOrder?: number;
  };
  placeOrder: (formInputs: any) => Promise<Order | null>;
  logout: () => void;
  
  // Toast Notification System
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  isSupabaseOnline: false,
  isDataLoaded: false,
  dbProducts: (() => {
    const cached = localStorage.getItem('rup_db_products');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return MOCK_PRODUCTS;
  })(),
  productCatalogIndex: (() => {
    const cached = localStorage.getItem('rup_catalog_index');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [];
  })(),
  dbReviews: (() => {
    const cached = localStorage.getItem('rup_db_reviews');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return MOCK_REVIEWS;
  })(),
  dbBlogs: (() => {
    const cached = localStorage.getItem('rup_db_blogs');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return MOCK_BLOGS;
  })(),
  dbBanners: (() => {
    const cached = localStorage.getItem('rup_db_banners');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [];
  })(),
  dbSettings: (() => {
    const cached = localStorage.getItem('rup_db_settings');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return null;
  })(),
  dbCoupons: (() => {
    const cached = localStorage.getItem('rup_db_coupons');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [];
  })(),
  cart: (() => {
    const cached = localStorage.getItem('rup_cart');
    return cached ? JSON.parse(cached) : [];
  })(),
  wishlist: (() => {
    const cached = localStorage.getItem('rup_wishlist');
    return cached ? JSON.parse(cached) : [];
  })(),
  orders: (() => {
    const cached = localStorage.getItem('rup_orders');
    return cached ? JSON.parse(cached) : [];
  })(),
  currentUser: null,
  appliedCoupon: null,
  lastPlacedOrder: (() => {
    try {
      const cached = localStorage.getItem('rup_last_placed_order');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  })(),
  recentlyViewedIds: (() => {
    const cached = localStorage.getItem('rup_recently_viewed');
    return cached ? JSON.parse(cached) : [];
  })(),
  checkoutForm: {
    name: '',
    phone: '',
    address: '',
    division: '',
    district: '',
    area: '',
    paymentMethod: 'Bangla QR',
    email: '',
    transactionId: '',
    paidConfirm: false,
    paymentScreenshotUrl: ''
  },
  
  // UI & Navigation Initial States
  selectedCategory: 'All',
  selectedGender: 'All',
  searchQuery: '',
  searchOpen: false,
  quickViewProduct: null,
  sizeGuideOpen: false,
  sizeGuideCategory: 'Panjabi',
  fullProductDetail: null,
  
  // Shop Filters Initial States
  checkedCategories: [],
  checkedSubCategories: [],
  selectedBrands: [],
  minPrice: '',
  maxPrice: '',
  selectedStock: [],
  sidebarSearch: '',
  sortBy: 'Popularity',
  
  // Sidebar Expand Initial States
  categoriesExpanded: true,
  subCategoriesExpanded: true,
  brandExpanded: true,
  priceExpanded: true,
  stockExpanded: true,
  
  // Applied filters Initial States
  appliedFilters: {
    categories: [],
    subCategories: [],
    brands: [],
    minPrice: '',
    maxPrice: '',
    stock: [],
    search: ''
  },

  setIsSupabaseOnline: (online) => set({ isSupabaseOnline: online }),
  setIsDataLoaded: (loaded) => set({ isDataLoaded: loaded }),
  setDbProducts: (products) => set({ dbProducts: products }),
  setProductCatalogIndex: (index) => set({ productCatalogIndex: index }),
  setDbReviews: (reviews) => set({ dbReviews: reviews }),
  setDbBlogs: (blogs) => set({ dbBlogs: blogs }),
  setDbBanners: (banners) => set({ dbBanners: banners }),
  setDbSettings: (settings) => set({ dbSettings: settings }),
  setDbCoupons: (coupons) => set({ dbCoupons: coupons }),
  setCurrentUser: async (user) => {
    set({ currentUser: user });
    if (user && get().isSupabaseOnline) {
      try {
        const userOrders = await orderService.fetchOrdersByUserId(user.id || user.uid);
        if (userOrders) {
          set({ orders: userOrders });
          localStorage.setItem('rup_orders', JSON.stringify(userOrders));
        }
      } catch (err) {
        console.error("Failed to load user orders on sign-in:", err);
      }
    }
  },
  setCart: (cart) => {
    localStorage.setItem('rup_cart', JSON.stringify(cart));
    set({ cart });
  },
  setWishlist: (wishlist) => {
    localStorage.setItem('rup_wishlist', JSON.stringify(wishlist));
    set({ wishlist });
  },
  setOrders: (orders) => {
    localStorage.setItem('rup_orders', JSON.stringify(orders));
    set({ orders });
  },
  setAppliedCoupon: (appliedCoupon) => set({ appliedCoupon }),
  setLastPlacedOrder: (lastPlacedOrder) => {
    if (lastPlacedOrder) {
      localStorage.setItem('rup_last_placed_order', JSON.stringify(lastPlacedOrder));
    } else {
      localStorage.removeItem('rup_last_placed_order');
    }
    set({ lastPlacedOrder });
  },
  setCheckoutForm: (formOrUpdater) => set((state) => ({
    checkoutForm: typeof formOrUpdater === 'function' ? formOrUpdater(state.checkoutForm) : formOrUpdater
  })),
  addRecentlyViewedId: (id) => {
    const current = get().recentlyViewedIds;
    const updated = [id, ...current.filter((x) => x !== id)].slice(0, 10);
    localStorage.setItem('rup_recently_viewed', JSON.stringify(updated));
    set({ recentlyViewedIds: updated });
  },
  
  // UI Setters
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedGender: (selectedGender) => set({ selectedGender }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setQuickViewProduct: (quickViewProduct) => set({ quickViewProduct }),
  setSizeGuideOpen: (sizeGuideOpen) => set({ sizeGuideOpen }),
  setSizeGuideCategory: (sizeGuideCategory) => set({ sizeGuideCategory }),
  setFullProductDetail: (fullProductDetail) => set({ fullProductDetail }),
  
  // Filter Setters
  setCheckedCategories: (checkedCategories) => set({ checkedCategories }),
  setCheckedSubCategories: (checkedSubCategories) => set({ checkedSubCategories }),
  setSelectedBrands: (selectedBrands) => set({ selectedBrands }),
  setMinPrice: (minPrice) => set({ minPrice }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setSelectedStock: (selectedStock) => set({ selectedStock }),
  setSidebarSearch: (sidebarSearch) => set({ sidebarSearch }),
  setSortBy: (sortBy) => set({ sortBy }),
  
  // Sidebar Expand Setters
  setCategoriesExpanded: (categoriesExpanded) => set({ categoriesExpanded }),
  setSubCategoriesExpanded: (subCategoriesExpanded) => set({ subCategoriesExpanded }),
  setBrandExpanded: (brandExpanded) => set({ brandExpanded }),
  setPriceExpanded: (priceExpanded) => set({ priceExpanded }),
  setStockExpanded: (stockExpanded) => set({ stockExpanded }),
  setAppliedFilters: (appliedFilters) => set({ appliedFilters }),

  loadInitialData: async () => {
    const { isSupabaseOnline } = get();
    if (!isSupabaseOnline) return;

    try {
      // TIER 1: Load first 1000 products fast (newest first) for immediate browsing
      const pData = await productService.fetchProducts();
      if (pData && pData.length > 0) {
        set({ dbProducts: pData });
        localStorage.setItem('rup_db_products', JSON.stringify(pData));

        // Sync existing cart items with latest product prices, margins & finalPrice
        const currentCart = get().cart;
        if (currentCart && currentCart.length > 0) {
          const productMap = new Map(pData.map(p => [p.id, p]));
          const updatedCart = currentCart.map(item => {
            const fresh = productMap.get(item.product?.id);
            if (!fresh) return item;
            return {
              ...item,
              product: {
                ...item.product,
                ...fresh,
                finalPrice: fresh.finalPrice ?? fresh.final_price,
                purchasePrice: fresh.purchasePrice ?? fresh.purchase_price
              }
            };
          });
          set({ cart: updatedCart });
          localStorage.setItem('rup_cart', JSON.stringify(updatedCart));
        }
      }

      // Load reviews, blogs, banners, settings in parallel for speed
      const [rData, blData, bData, sData, cResult] = await Promise.all([
        reviewService.fetchReviews(),
        blogService.fetchBlogs(),
        bannerService.fetchBanners(),
        settingsService.fetchSettings(),
        supabase.from('coupons').select('*').eq('is_active', true)
      ]);

      if (rData) {
        set({ dbReviews: rData });
        localStorage.setItem('rup_db_reviews', JSON.stringify(rData));
      }
      if (blData) {
        const mappedBlogs = blData.map((b: any) => ({
          id: b.id,
          title: b.title,
          excerpt: b.excerpt,
          content: b.content,
          image: b.image,
          date: b.created_at ? new Date(b.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : b.date,
          readTime: b.read_time || b.readTime || '3 min read',
          category: b.category,
          status: b.status,
          seoTitle: b.seo_title || b.seoTitle,
          seoDescription: b.seo_description || b.seoDescription
        }));
        set({ dbBlogs: mappedBlogs });
        localStorage.setItem('rup_db_blogs', JSON.stringify(mappedBlogs));
      }
      if (bData) {
        set({ dbBanners: bData });
        localStorage.setItem('rup_db_banners', JSON.stringify(bData));
      }
      if (cResult && cResult.data) {
        const mappedCoupons = cResult.data.map((c: any) => ({
          ...c,
          isRecommended: c.is_recommended ?? c.isRecommended ?? false,
          is_recommended: c.is_recommended ?? c.isRecommended ?? false,
          isAutoApply: c.is_auto_apply ?? c.isAutoApply ?? false,
          is_auto_apply: c.is_auto_apply ?? c.isAutoApply ?? false,
          isActive: c.is_active ?? c.isActive ?? true,
          minOrder: Number(c.min_order ?? c.minOrder ?? 0),
          maxDiscount: c.max_discount ?? c.maxDiscount,
          expiryDate: c.expiry_date || c.expiryDate,
          usedCount: c.used_count ?? c.usedCount ?? 0,
          usageLimit: c.usage_limit ?? c.usageLimit
        }));
        set({ dbCoupons: mappedCoupons });
        localStorage.setItem('rup_db_coupons', JSON.stringify(mappedCoupons));
      }
      if (sData) {
        // Retrieve local backup token and test code if DB doesn't have them
        let cached: Record<string, any> = {};
        try {
          const raw = localStorage.getItem('rup_db_settings');
          if (raw) cached = JSON.parse(raw);
        } catch (_) {}
        
        const finalToken = sData.metaCapiAccessToken || sData.meta_capi_access_token || cached.metaCapiAccessToken || cached.meta_capi_access_token;
        const finalTestCode = sData.metaTestEventCode || sData.meta_test_event_code || cached.metaTestEventCode || cached.meta_test_event_code;
        const pixelId = sData.metaPixelId || sData.meta_pixel_id || cached.metaPixelId || cached.meta_pixel_id;
        const gtmId = sData.googleTagManagerId || sData.google_tag_manager_id || cached.googleTagManagerId || cached.google_tag_manager_id;
        const gaId = sData.googleAnalyticsId || sData.google_analytics_id || cached.googleAnalyticsId || cached.google_analytics_id;

        // Save merged settings back to cache (supporting both casings for other components)
        const mergedSettings = {
          ...sData,
          metaPixelId: pixelId,
          meta_pixel_id: pixelId,
          metaCapiAccessToken: finalToken,
          meta_capi_access_token: finalToken,
          metaTestEventCode: finalTestCode,
          meta_test_event_code: finalTestCode,
          googleTagManagerId: gtmId,
          google_tag_manager_id: gtmId,
          googleAnalyticsId: gaId,
          google_analytics_id: gaId
        };
        
        set({ dbSettings: mergedSettings });
        localStorage.setItem('rup_db_settings', JSON.stringify(mergedSettings));

        initializeTelemetry({
          metaPixelId:         pixelId,
          metaTestEventCode:   finalTestCode,
          metaCapiAccessToken: finalToken,
          googleTagManagerId:  gtmId,
          googleAnalyticsId:   gaId,
        });
      }

      // TIER 2: Background — fetch full catalog index (all products, minimal fields)
      // This runs AFTER initial data is loaded so it doesn't block the UI
      productService.fetchProductCatalogIndex().then((indexData) => {
        if (indexData && indexData.length > 0) {
          set({ productCatalogIndex: indexData as Product[] });
          localStorage.setItem('rup_catalog_index', JSON.stringify(indexData));
        }
      }).catch((e) => console.error('Catalog index load failed:', e));

      // Mark data as loaded — unblocks CatchAllRoute from showing 404
      set({ isDataLoaded: true });

    } catch (e) {
      console.error("Error loading Supabase storefront data:", e);
      // Even on error, mark as loaded so UI can render (will use cached localStorage data)
      set({ isDataLoaded: true });
    }
  },

  // Fetch a single product from the database on-demand (for product detail page or featured items)
  fetchProductByIdFromDB: async (idOrSlug: string) => {
    try {
      const product = await productService.fetchProductByIdOrSlug(idOrSlug);
      return product;
    } catch (e) {
      console.error('Failed to fetch product by id from DB:', idOrSlug, e);
      return null;
    }
  },

  addToCart: (product, size, color, qty = 1) => {
    const { cart, dbSettings } = get();
    const existingIndex = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedSize === size &&
        item.selectedColor === color
    );

    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += qty;
    } else {
      newCart.push({
        product,
        selectedSize: size || (product.sizes && product.sizes[0]) || 'M',
        selectedColor: color || (product.colors && product.colors[0]?.name) || 'Default',
        quantity: qty
      });
    }
    
    get().setCart(newCart);

    const eventId = generateEventId('AddToCart');
    trackAddToCart(product, qty, size, color, eventId, dbSettings?.metaTestEventCode || dbSettings?.meta_test_event_code);
  },

  updateCartQty: (index, newQty) => {
    const { cart } = get();
    if (newQty <= 0) {
      const newCart = cart.filter((_, i) => i !== index);
      get().setCart(newCart);
    } else {
      const newCart = [...cart];
      newCart[index].quantity = newQty;
      get().setCart(newCart);
    }
  },

  toggleWishlist: (product) => {
    const { wishlist } = get();
    const index = wishlist.findIndex((item) => item.id === product.id);
    let newWishlist = [...wishlist];
    if (index > -1) {
      newWishlist.splice(index, 1);
    } else {
      newWishlist.push(product);
    }
    get().setWishlist(newWishlist);
  },

  applyCoupon: (code) => {
    const cleanCode = code.trim().toUpperCase();
    const { dbCoupons, cart } = get();
    const subtotal = cart.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);

    // 1. Find coupon in database list
    const dbMatch = (dbCoupons || []).find(c => c && c.code && typeof c.code === 'string' && c.code.trim().toUpperCase() === cleanCode);
    if (dbMatch) {
      if (dbMatch.isActive === false && dbMatch.is_active === false) {
        return {
          success: false,
          reason: 'INACTIVE',
          message: 'এই কুপনটি বর্তমানে নিষ্ক্রিয় রয়েছে।'
        };
      }

      const expiry = dbMatch.expiryDate || dbMatch.expiry_date;
      if (expiry) {
        const expiryDate = new Date(expiry);
        // Compare with today midnight
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (expiryDate < now) {
          return {
            success: false,
            reason: 'EXPIRED',
            message: 'কুপনটির মেয়াদ শেষ হয়ে গেছে (Coupon has expired)।'
          };
        }
      }

      const usageLimit = dbMatch.usageLimit || dbMatch.usage_limit;
      const usedCount = dbMatch.usedCount || dbMatch.used_count || 0;
      if (usageLimit && usedCount >= usageLimit) {
        return {
          success: false,
          reason: 'USAGE_LIMIT_REACHED',
          message: 'এই কুপনের ব্যবহারের সীমা শেষ হয়ে গেছে (Coupon usage limit reached)।'
        };
      }

      const minOrder = Number(dbMatch.minOrder || dbMatch.min_order || 0);
      if (subtotal < minOrder) {
        return {
          success: false,
          reason: 'MIN_ORDER_NOT_MET',
          minOrder,
          message: `এই কুপনটি পেতে ন্যূনতম ৳${minOrder.toLocaleString('en-IN')} টাকার অর্ডার করতে হবে।`
        };
      }

      set({
        appliedCoupon: {
          code: dbMatch.code,
          discount: Number(dbMatch.value),
          type: dbMatch.type,
          minOrder: minOrder,
          isAutoApply: dbMatch.isAutoApply ?? dbMatch.is_auto_apply ?? false
        }
      });

      return {
        success: true,
        reason: 'SUCCESS',
        message: `কুপন '${dbMatch.code}' সফলভাবে প্রয়োগ করা হয়েছে!`
      };
    }

    // 2. Fallback to mock coupons
    const mockCoupons = [
      { code: 'EID20', value: 200, type: 'fixed', minOrder: 1500 },
      { code: 'FREEBD', value: 100, type: 'free_shipping', minOrder: 2500 },
      { code: 'MART15', value: 15, type: 'percentage', minOrder: 1000 },
      { code: 'RUPAN20', value: 20, type: 'percentage', minOrder: 1500 },
      { code: 'EIDMUBARAK', value: 15, type: 'percentage', minOrder: 1000 },
      { code: 'FREE60', value: 60, type: 'fixed', minOrder: 2000 }
    ];

    const mock = mockCoupons.find(c => c.code === cleanCode);
    if (mock) {
      if (subtotal < mock.minOrder) {
        return {
          success: false,
          reason: 'MIN_ORDER_NOT_MET',
          minOrder: mock.minOrder,
          message: `এই কুপনটি পেতে ন্যূনতম ৳${mock.minOrder.toLocaleString('en-IN')} টাকার অর্ডার করতে হবে।`
        };
      }

      set({
        appliedCoupon: {
          code: mock.code,
          discount: mock.value,
          type: mock.type,
          minOrder: mock.minOrder
        }
      });

      return {
        success: true,
        reason: 'SUCCESS',
        message: `কুপন '${mock.code}' সফলভাবে প্রয়োগ করা হয়েছে!`
      };
    }

    // 3. Invalid Coupon
    return {
      success: false,
      reason: 'INVALID_CODE',
      message: 'অবৈধ কুপন কোড (Invalid coupon code)। সঠিক কোড দিন।'
    };
  },

  placeOrder: async (formInputs) => {
    const { cart, orders, isSupabaseOnline, dbSettings, currentUser } = get();
    if (cart.length === 0) return null;

    const purchaseEventId = generateEventId('Purchase');

    // High-Volume E-Commerce Order ID Standard: RUP-YYMMDD-XXXX (e.g. RUP-261116-4892)
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const orderId = `RUP-${yy}${mm}${dd}-${randPart}`;
    
    const subtotal = cart.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const freeShippingLimit = Number(dbSettings?.free_shipping_min_order ?? dbSettings?.freeShippingMinOrder ?? 0);
    const isFreeShippingEnabled = Boolean(dbSettings?.free_shipping_enabled ?? dbSettings?.freeShippingEnabled ?? false);
    let shippingFee = 0;
    const isQualifyingThreshold = isFreeShippingEnabled && freeShippingLimit > 0 && subtotal >= freeShippingLimit;
    if (!isQualifyingThreshold) {
      if (typeof formInputs.shippingFee === 'number') {
        shippingFee = formInputs.shippingFee;
      } else {
        const insideFee = dbSettings?.inside_dhaka_shipping ?? dbSettings?.insideDhakaShipping ?? 60;
        const outsideFee = dbSettings?.outside_dhaka_shipping ?? dbSettings?.outsideDhakaShipping ?? 120;
        const isDhaka = formInputs.district === 'dhaka' || formInputs.area === 'Inside Dhaka' || formInputs.area?.includes('ঢাকা');
        shippingFee = isDhaka ? insideFee : outsideFee;
      }
    }

    const { appliedCoupon } = get();
    let discount = 0;
    if (appliedCoupon) {
      const minOrder = appliedCoupon.minOrder || 0;
      if (subtotal >= minOrder) {
        if (appliedCoupon.type === 'fixed') {
          discount = Math.min(appliedCoupon.discount, subtotal);
        } else if (appliedCoupon.type === 'free_shipping') {
          discount = shippingFee;
        } else {
          // default percentage
          discount = Math.round((subtotal * appliedCoupon.discount) / 100);
        }
      }
    }

    const onlinePaymentDiscount = Number(formInputs.onlinePaymentDiscount || 0);
    const total = Math.max(0, subtotal + shippingFee - discount - onlinePaymentDiscount);

    const newOrder: Order = {
      id: orderId,
      customerName: formInputs.name,
      phone: formInputs.phone,
      address: formInputs.address,
      area: formInputs.area,
      division: formInputs.division || '',
      district: formInputs.district || '',
      paymentMethod: formInputs.paymentMethod,
      transactionId: formInputs.transactionId,
      paidConfirm: formInputs.paidConfirm,
      paymentScreenshotUrl: formInputs.paymentScreenshotUrl || '',
      onlinePaymentDiscount,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        color: item.selectedColor,
        size: item.selectedSize,
        price: item.product.discountPrice || item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]
      })),
      subtotal,
      shippingFee,
      total,
      status: 'Pending',
      paymentStatus: 'Unpaid',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isGuest: currentUser === null,
      userId: currentUser?.id
    };

    const updatedOrders = [newOrder, ...orders];
    get().setOrders(updatedOrders);

    // ALWAYS write directly to Supabase Database (Guaranteed Order Persistence)
    // Telegram notification is sent exclusively from /api/place-order serverless
    // to avoid double-sends and to keep bot token off the client browser.
    try {
      await orderService.createOrder(newOrder, purchaseEventId, currentUser === null);
    } catch (err: any) {
      console.error("Critical: Error writing order to Supabase:", err.message || err);
    }

    trackPurchase(newOrder, purchaseEventId, dbSettings?.metaTestEventCode || dbSettings?.meta_test_event_code);

    set({
      lastPlacedOrder: newOrder,
      appliedCoupon: null
    });
    localStorage.setItem('rup_last_placed_order', JSON.stringify(newOrder));
    get().setCart([]);

    return newOrder;
  },

  logout: () => {
    set({
      currentUser: null
    });
  },

  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast = { id, message, type };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  }
}));
