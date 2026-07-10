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

interface StoreState {
  isSupabaseOnline: boolean;
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
  appliedCoupon: { code: string; discount: number } | null;
  lastPlacedOrder: Order | null;
  recentlyViewedIds: string[];
  checkoutForm: {
    name: string;
    phone: string;
    address: string;
    area: string;
    paymentMethod: string;
    email: string;
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
  setAppliedCoupon: (coupon: { code: string; discount: number } | null) => void;
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
  applyCoupon: (code: string) => boolean;
  placeOrder: (formInputs: any) => Promise<Order | null>;
  logout: () => void;
  
  // Toast Notification System
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  isSupabaseOnline: false,
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
  currentUser: {
    username: 'test',
    displayName: 'test',
    email: 'phone-534534563453-nz9rfv2h@borbila.invalid',
    phone: '534534563453',
    billingAddress: 'test',
    shippingAddress: 'test',
    city: 'Dhaka',
    zip: '1000'
  },
  appliedCoupon: null,
  lastPlacedOrder: null,
  recentlyViewedIds: (() => {
    const cached = localStorage.getItem('rup_recently_viewed');
    return cached ? JSON.parse(cached) : [];
  })(),
  checkoutForm: {
    name: 'test',
    phone: '534534563453',
    address: 'test',
    area: 'Inside Dhaka',
    paymentMethod: 'Cash on Delivery',
    email: 'phone-534534563453-nz9rfv2h@borbila.invalid'
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
  setLastPlacedOrder: (lastPlacedOrder) => set({ lastPlacedOrder }),
  setCheckoutForm: (checkoutForm) => set({ checkoutForm }),
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
        set({ dbCoupons: cResult.data });
        localStorage.setItem('rup_db_coupons', JSON.stringify(cResult.data));
      }
      if (sData) {
        set({ dbSettings: sData });
        localStorage.setItem('rup_db_settings', JSON.stringify(sData));
        initializeTelemetry({
          metaPixelId: sData.meta_pixel_id,
          metaTestEventCode: sData.meta_test_event_code,
          googleTagManagerId: sData.google_tag_manager_id,
          googleAnalyticsId: sData.google_analytics_id
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

    } catch (e) {
      console.error("Error loading Supabase storefront data:", e);
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
    trackAddToCart(product, qty, size, color, eventId, dbSettings?.meta_test_event_code);
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
    const { dbCoupons } = get();
    
    // Find coupon in database list first
    const coupon = dbCoupons.find(c => c.code === cleanCode && (c.isActive || c.is_active));
    if (coupon) {
      const expiry = coupon.expiryDate || coupon.expiry_date;
      if (expiry) {
        const expiryDate = new Date(expiry);
        const now = new Date();
        if (expiryDate < now) return false;
      }
      
      const usageLimit = coupon.usageLimit || coupon.usage_limit;
      const usedCount = coupon.usedCount || coupon.used_count || 0;
      if (usageLimit && usedCount >= usageLimit) return false;
      
      const minOrder = coupon.minOrder || coupon.min_order || 0;
      
      set({ 
        appliedCoupon: { 
          code: coupon.code, 
          discount: Number(coupon.value), 
          type: coupon.type, 
          minOrder: Number(minOrder) 
        } 
      });
      return true;
    }
    
    // Fallback to local hardcoded mock coupons
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
      set({ 
        appliedCoupon: { 
          code: mock.code, 
          discount: mock.value, 
          type: mock.type, 
          minOrder: mock.minOrder 
        } 
      });
      return true;
    }
    
    return false;
  },

  placeOrder: async (formInputs) => {
    const { cart, orders, isSupabaseOnline, dbSettings, currentUser } = get();
    if (cart.length === 0) return null;

    const purchaseEventId = generateEventId('Purchase');
    const orderId = `RUP-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const subtotal = cart.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const freeShippingLimit = dbSettings?.free_shipping_min_order ?? dbSettings?.freeShippingMinOrder ?? 3000;
    let shippingFee = 0;
    if (subtotal < freeShippingLimit) {
      const insideFee = dbSettings?.inside_dhaka_shipping ?? dbSettings?.insideDhakaShipping ?? 60;
      const outsideFee = dbSettings?.outside_dhaka_shipping ?? dbSettings?.outsideDhakaShipping ?? 120;
      shippingFee = formInputs.area === 'Inside Dhaka' ? insideFee : outsideFee;
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

    const total = subtotal + shippingFee - discount;

    const newOrder: Order = {
      id: orderId,
      customerName: formInputs.name,
      phone: formInputs.phone,
      address: formInputs.address,
      area: formInputs.area,
      paymentMethod: formInputs.paymentMethod,
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

    if (isSupabaseOnline) {
      try {
        await orderService.createOrder(newOrder, purchaseEventId, currentUser === null);
      } catch (err: any) {
        console.error("Error writing order to Supabase:", err.message || err);
      }
    }

    trackPurchase(newOrder, purchaseEventId, dbSettings?.meta_test_event_code);

    set({
      lastPlacedOrder: newOrder,
      appliedCoupon: null
    });
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
