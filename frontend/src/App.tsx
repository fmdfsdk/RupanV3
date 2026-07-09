/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, ShoppingBag, ShieldCheck, Truck, RotateCcw, 
  MessageCircle, Star, Sparkles, Flame, CheckCircle, 
  ArrowRight, Search, Percent, Info, MapPin, Phone, 
  CreditCard, Eye, LayoutDashboard, ListOrdered, Users, 
  ShoppingBasket, RefreshCw, BarChart3, HelpCircle, FileText,
  X
} from 'lucide-react';

import { Product, CartItem, Order, Review, BlogPost } from './types';
import { PRODUCTS as MOCK_PRODUCTS, REVIEWS as MOCK_REVIEWS, BLOGS as MOCK_BLOGS, FAQ } from './data';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import QuickViewModal from './components/QuickViewModal';
import SizeGuideModal from './components/SizeGuideModal';
import WhatsAppButton from './components/WhatsAppButton';
import AdminPanel from './components/AdminPanel';
import ProductDetail from './components/ProductDetail';
import BlogPage from './components/BlogPage';
import { checkSupabaseConnection, supabase } from './lib/supabase';
import { 
  generateEventId, 
  initializeTelemetry, 
  trackPageView, 
  trackViewContent, 
  trackAddToCart, 
  trackInitiateCheckout, 
  trackPurchase 
} from './lib/telemetry';

export default function App() {
  // Navigation & UI States
  const [activePage, setActivePage] = useState<string>('home');
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(false);

  // Dynamic state loaded from Supabase (or fallback to localStorage / mock data)
  const [dbProducts, setDbProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem('rup_db_products');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return MOCK_PRODUCTS;
  });
  
  const [dbReviews, setDbReviews] = useState<Review[]>(() => {
    const cached = localStorage.getItem('rup_db_reviews');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return MOCK_REVIEWS;
  });
  
  const [dbBlogs, setDbBlogs] = useState<BlogPost[]>(() => {
    const cached = localStorage.getItem('rup_db_blogs');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return MOCK_BLOGS;
  });
  
  const [dbBanners, setDbBanners] = useState<any[]>(() => {
    const cached = localStorage.getItem('rup_db_banners');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [];
  });
  
  const [dbSettings, setDbSettings] = useState<any>(() => {
    const cached = localStorage.getItem('rup_db_settings');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return null;
  });

  // Shadow variables for in-component usage
  const PRODUCTS = dbProducts;
  const REVIEWS = dbReviews;
  const BLOGS = dbBlogs;

  useEffect(() => {
    const runCheck = async () => {
      try {
        const isOnline = await checkSupabaseConnection();
        setIsSupabaseOnline(isOnline);
      } catch (err) {
        setIsSupabaseOnline(false);
      }
    };
    runCheck();
  }, [activePage]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false);
  const [sizeGuideCategory, setSizeGuideCategory] = useState<string>('Panjabi');

  // Interactive Shop Filters & Sorting States
  const [checkedCategories, setCheckedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedStock, setSelectedStock] = useState<string[]>([]);
  const [sidebarSearch, setSidebarSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Popularity');

  // Collapsible section triggers
  const [categoriesExpanded, setCategoriesExpanded] = useState<boolean>(true);
  const [brandExpanded, setBrandExpanded] = useState<boolean>(true);
  const [priceExpanded, setPriceExpanded] = useState<boolean>(true);
  const [stockExpanded, setStockExpanded] = useState<boolean>(true);

  // Consolidated applied filters for clicking "Apply Filter"
  const [appliedFilters, setAppliedFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    minPrice: '',
    maxPrice: '',
    stock: [] as string[],
    search: ''
  });

  // Dynamic Route Parameters State
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [currentBlogId, setCurrentBlogId] = useState<string | null>(null);

  // Synchronize URL pathname changes with state-driven rendering
  useEffect(() => {
    const handleLocationChange = () => {
      let pathPart = window.location.pathname || '/';
      const queryPart = window.location.search || '';

      // Normalize trailing slash (except for '/')
      if (pathPart.length > 1 && pathPart.endsWith('/')) {
        pathPart = pathPart.slice(0, -1);
      }

      const queryParams: Record<string, string> = {};
      if (queryPart) {
        queryPart.substring(1).split('&').forEach((param) => {
          const [key, val] = param.split('=');
          if (key && val) {
            queryParams[decodeURIComponent(key)] = decodeURIComponent(val);
          }
        });
      }

      if (pathPart === '/' || pathPart === '') {
        setActivePage('home');
      } else if (pathPart === '/shop') {
        setActivePage('shop');
        if (queryParams.category) {
          setSelectedCategory(queryParams.category);
        } else {
          setSelectedCategory('All');
        }
        if (queryParams.gender) {
          setSelectedGender(queryParams.gender);
        } else {
          setSelectedGender('All');
        }
        if (queryParams.search) {
          setSearchQuery(queryParams.search);
        }
      } else if (pathPart.startsWith('/product/')) {
        let id = pathPart.substring('/product/'.length);
        if (id.endsWith('/')) {
          id = id.slice(0, -1);
        }
        const getProductSlug = (name: string) => {
          return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        };
        const found = PRODUCTS.find(p => p.id === id || getProductSlug(p.name) === id);
        if (found) {
          setCurrentProductId(found.id);
        } else {
          setCurrentProductId(id);
        }
        setActivePage('product-detail');
      } else if (pathPart.startsWith('/blog/')) {
        const id = pathPart.substring('/blog/'.length);
        setCurrentBlogId(id);
        setActivePage('blog-detail');
      } else if (pathPart === '/blog' || pathPart === '/blogs') {
        setActivePage('blog');
      } else if (pathPart === '/cart') {
        setActivePage('cart');
      } else if (pathPart === '/checkout') {
        setActivePage('checkout');
      } else if (pathPart === '/order-success') {
        setActivePage('order-success');
      } else if (pathPart === '/track-order') {
        setActivePage('track-order');
      } else if (pathPart === '/faq' || pathPart === '/faqs') {
        setActivePage('faq');
      } else if (pathPart === '/policy') {
        setActivePage('policy');
      } else if (pathPart === '/account' || pathPart === '/my-account') {
        setActivePage('account');
      } else if (pathPart === '/register') {
        setActivePage('account');
        setIsRegistering(true);
      } else if (pathPart === '/about-us') {
        setActivePage('about-us');
      } else if (pathPart === '/product-search') {
        setActivePage('product-search');
      } else if (pathPart === '/contact-us') {
        setActivePage('contact-us');
      } else if (pathPart === '/offer' || pathPart === '/offers') {
        setActivePage('offers');
      } else if (pathPart === '/new-arrival' || pathPart === '/new-arrivals') {
        setActivePage('new-arrival');
      } else if (pathPart === '/categories') {
        setActivePage('categories');
      } else if (pathPart === '/admin' || pathPart === '/admin-dashboard') {
        setActivePage('admin-dashboard');
      } else if (pathPart === '/wishlist') {
        setActivePage('wishlist');
      } else {
        setActivePage('home');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange(); // Execute initially on mount

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Intercept click events on standard anchor tags for smooth client-side pathname transitions
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          e.preventDefault();
          navigateTo(href);
        }
      }
    };
    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  const navigateTo = (pageId: string) => {
    let targetPath = pageId;

    if (pageId === 'home' || pageId === '/') {
      targetPath = '/';
    } else if (pageId === 'shop') {
      targetPath = '/shop';
    } else if (pageId === 'cart') {
      targetPath = '/cart';
    } else if (pageId === 'checkout') {
      targetPath = '/checkout';
    } else if (pageId === 'account' || pageId === 'my-account') {
      targetPath = '/my-account';
    } else if (pageId === 'register') {
      targetPath = '/register';
    } else if (pageId === 'track-order') {
      targetPath = '/track-order';
    } else if (pageId === 'about-us') {
      targetPath = '/about-us';
    } else if (pageId === 'product-search') {
      targetPath = '/product-search';
    } else if (pageId === 'contact-us') {
      targetPath = '/contact-us';
    } else if (pageId === 'offer' || pageId === 'offers') {
      targetPath = '/offer';
    } else if (pageId === 'faq' || pageId === 'faqs') {
      targetPath = '/faqs';
    } else if (pageId === 'new-arrival' || pageId === 'new-arrivals') {
      targetPath = '/new-arrival';
    } else if (pageId === 'blog' || pageId === 'blogs') {
      targetPath = '/blogs';
    } else if (pageId === 'categories') {
      targetPath = '/categories';
    } else if (pageId === 'best-sellers') {
      targetPath = '/shop?category=Best%20Sellers';
    } else if (!pageId.startsWith('/')) {
      targetPath = `/${pageId}`;
    }

    window.history.pushState(null, '', targetPath);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Customer Data States
  const [currentUser, setCurrentUser] = useState<any>({
    username: 'test',
    displayName: 'test',
    email: 'phone-534534563453-nz9rfv2h@borbila.invalid',
    phone: '534534563453',
    billingAddress: 'test',
    shippingAddress: 'test',
    city: 'Dhaka',
    zip: '1000'
  });
  const [subTab, setSubTab] = useState<string>('Dashboard');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Pre-loaded/placed Orders for Tracking Simulation
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '4237',
      customerName: 'test',
      phone: '534534563453',
      address: 'test',
      area: 'Inside Dhaka',
      paymentMethod: 'Cash on Delivery',
      items: [
        {
          productId: 'watch-005',
          productName: 'SteelMark Classic Black Dial Watch',
          color: 'Classic Silver',
          size: 'Adjustable',
          price: 1990,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'
        }
      ],
      subtotal: 1990,
      shippingFee: 50,
      total: 2040,
      status: 'Processing',
      createdAt: 'July 6, 2026'
    },
    {
      id: 'RUP-9524',
      customerName: 'Kazi Nafis',
      phone: '01711223344',
      address: 'House 42, Road 11, Banani',
      area: 'Inside Dhaka',
      paymentMethod: 'bKash',
      items: [
        {
          productId: 'rup-001',
          productName: 'Royal Heritage Jacquard Panjabi',
          color: 'Royal Blue',
          size: 'XL',
          price: 2850,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop'
        }
      ],
      subtotal: 2850,
      shippingFee: 60,
      total: 2910,
      status: 'Shipped',
      createdAt: '2026-07-02 14:30'
    }
  ]);

  // Tracking Query Inputs
  const [trackOrderId, setTrackOrderId] = useState<string>('');
  const [trackPhone, setTrackPhone] = useState<string>('');
  const [trackingResult, setTrackingResult] = useState<Order | null>(null);
  const [trackingSearched, setTrackingSearched] = useState<boolean>(false);

  // Login States
  const [loginUsername, setLoginUsername] = useState<string>('test');
  const [loginPassword, setLoginPassword] = useState<string>('test');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Register form states
  const [regUsername, setRegUsername] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');

  // Interactive Contact Us Form States
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactSubject, setContactSubject] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [isSubmittingContact, setIsSubmittingContact] = useState<boolean>(false);
  const [contactSuccess, setContactSuccess] = useState<boolean>(false);

  // Dedicated Product Search Page States
  const [searchPageQuery, setSearchPageQuery] = useState<string>('');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Account Details Edit States
  const [profileFirstName, setProfileFirstName] = useState<string>('test');
  const [profileLastName, setProfileLastName] = useState<string>('');
  const [profileDisplayName, setProfileDisplayName] = useState<string>('test');
  const [profileEmail, setProfileEmail] = useState<string>('phone-534534563453-nz9rfv2h@borbila.invalid');

  // Address Edit States
  const [addressBillingStreet, setAddressBillingStreet] = useState<string>('test');
  const [addressBillingCity, setAddressBillingCity] = useState<string>('Dhaka');
  const [addressBillingZip, setAddressBillingZip] = useState<string>('1000');
  const [addressShippingStreet, setAddressShippingStreet] = useState<string>('test');
  const [addressShippingCity, setAddressShippingCity] = useState<string>('Dhaka');
  const [addressShippingZip, setAddressShippingZip] = useState<string>('1000');

  const [isEditingBilling, setIsEditingBilling] = useState<boolean>(false);
  const [isEditingShipping, setIsEditingShipping] = useState<boolean>(false);

  // Checkout Form Input State
  const [checkoutForm, setCheckoutForm] = useState({
    name: 'test',
    phone: '534534563453',
    address: 'test',
    area: 'Inside Dhaka',
    paymentMethod: 'Cash on Delivery',
    email: 'phone-534534563453-nz9rfv2h@borbila.invalid'
  });

  // Automatically update checkoutForm and Address form inputs based on currentUser
  useEffect(() => {
    if (currentUser) {
      setCheckoutForm({
        name: currentUser.displayName || currentUser.username || '',
        phone: currentUser.phone || '',
        address: currentUser.shippingAddress || currentUser.billingAddress || '',
        area: currentUser.city === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka',
        paymentMethod: 'Cash on Delivery',
        email: currentUser.email || ''
      });
      setAddressBillingStreet(currentUser.billingAddress || 'test');
      setAddressBillingCity(currentUser.city || 'Dhaka');
      setAddressBillingZip(currentUser.zip || '1000');
      setAddressShippingStreet(currentUser.shippingAddress || 'test');
      setAddressShippingCity(currentUser.city || 'Dhaka');
      setAddressShippingZip(currentUser.zip || '1000');
      
      setProfileFirstName(currentUser.username || 'test');
      setProfileDisplayName(currentUser.displayName || currentUser.username || 'test');
      setProfileEmail(currentUser.email || '');
    } else {
      setCheckoutForm({
        name: '',
        phone: '',
        address: '',
        area: 'Inside Dhaka',
        paymentMethod: 'Cash on Delivery',
        email: ''
      });
      setAddressBillingStreet('');
      setAddressBillingCity('Dhaka');
      setAddressBillingZip('1000');
      setAddressShippingStreet('');
      setAddressShippingCity('Dhaka');
      setAddressShippingZip('1000');
    }
  }, [currentUser]);

  // Active hero carousel slide
  const [heroSlide, setHeroSlide] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(86327); // 23h 58m 27s
  const heroBanners = [
    {
      title: 'EID UL ADHA FESTIVAL COLLECTION',
      highlight: 'Royal Jacquard Panjabi',
      subtitle: 'Style That Speaks Traditional Luxury',
      bgUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
      ctaText: 'Shop Panjabi Collection',
      category: 'Panjabi'
    },
    {
      title: 'EXCLUSIVE COORDINATED MATCHING SETS',
      highlight: 'Crimson Love Couple Sets',
      subtitle: 'Synchronized Elegance For Special Celebrations',
      bgUrl: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=1200&auto=format&fit=crop',
      ctaText: 'Shop Couple Collection',
      category: 'Couple Collection'
    },
    {
      title: 'MODERN COTTON ESSENTIALS',
      highlight: 'Premium Combed Cotton T-Shirts',
      subtitle: 'Ultra-Soft, High-Strength 180 GSM Fabric',
      bgUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop',
      ctaText: 'Shop Western Collections',
      category: 'T-Shirts'
    }
  ];

  // Auto sliding carousel effect
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 86399));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync Cart and Wishlist with LocalStorage on init
  useEffect(() => {
    const cachedCart = localStorage.getItem('rup_cart');
    const cachedWishlist = localStorage.getItem('rup_wishlist');
    const cachedOrders = localStorage.getItem('rup_orders');
    
    if (cachedCart) setCart(JSON.parse(cachedCart));
    if (cachedWishlist) setWishlist(JSON.parse(cachedWishlist));
    if (cachedOrders) setOrders(JSON.parse(cachedOrders));
  }, []);

  const saveCartToStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('rup_cart', JSON.stringify(newCart));
  };

  const saveWishlistToStorage = (newWishlist: Product[]) => {
    setWishlist(newWishlist);
    localStorage.setItem('rup_wishlist', JSON.stringify(newWishlist));
  };

  // Add item to Cart
  const handleAddToCart = (product: Product, size: string, color: string, qty: number = 1) => {
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
        selectedSize: size || product.sizes[0] || 'M',
        selectedColor: color || product.colors[0]?.name || 'Default',
        quantity: qty
      });
    }
    saveCartToStorage(newCart);

    // Trigger Telemetry Event
    const eventId = generateEventId('AddToCart');
    trackAddToCart(product, qty, size, color, eventId, dbSettings?.meta_test_event_code);
  };

  // Instant Buy Now CTA (adds to cart and redirects straight to checkout)
  const handleBuyNow = (product: Product, size: string, color: string) => {
    handleAddToCart(product, size, color, 1);
    setActivePage('checkout');
  };

  // Toggle wishlist item
  const handleToggleWishlist = (product: Product) => {
    const index = wishlist.findIndex((item) => item.id === product.id);
    let newWishlist = [...wishlist];
    if (index > -1) {
      newWishlist.splice(index, 1);
    } else {
      newWishlist.push(product);
    }
    saveWishlistToStorage(newWishlist);
  };

  // Update cart item quantity
  const handleUpdateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      const newCart = cart.filter((_, i) => i !== index);
      saveCartToStorage(newCart);
    } else {
      const newCart = [...cart];
      newCart[index].quantity = newQty;
      saveCartToStorage(newCart);
    }
  };

  // Apply Discount Coupon code
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === 'RUPAN20') {
      setAppliedCoupon({ code: 'RUPAN20', discount: 20 });
    } else if (cleanCode === 'EIDMUBARAK') {
      setAppliedCoupon({ code: 'EIDMUBARAK', discount: 15 });
    } else if (cleanCode === 'FREE60') {
      setAppliedCoupon({ code: 'FREE60', discount: 100 }); // flat shipping waiver or discount
    } else {
      alert('Invalid Coupon Code! Try "RUPAN20" for 20% discount or "EIDMUBARAK" for 15% discount.');
    }
  };

  // Calculate pricing subtotals
  const getSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);
  };

  const getShippingFee = () => {
    if (cart.length === 0) return 0;
    const freeShippingLimit = dbSettings?.free_shipping_min_order ?? dbSettings?.freeShippingMinOrder ?? 3000;
    if (getSubtotal() >= freeShippingLimit) return 0;
    const insideFee = dbSettings?.inside_dhaka_shipping ?? dbSettings?.insideDhakaShipping ?? 60;
    const outsideFee = dbSettings?.outside_dhaka_shipping ?? dbSettings?.outsideDhakaShipping ?? 120;
    return checkoutForm.area === 'Inside Dhaka' ? insideFee : outsideFee;
  };

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.code === 'FREE60') return 60; // Waive flat shipping or equivalent
    return Math.round((getSubtotal() * appliedCoupon.discount) / 100);
  };

  const getTotal = () => {
    return getSubtotal() + getShippingFee() - getDiscountAmount();
  };

  // Load database tables once Supabase is verified online
  useEffect(() => {
    const loadData = async () => {
      if (isSupabaseOnline) {
        try {
          // Fetch products
          const { data: pData } = await supabase.from('products').select('*').eq('status', 'published');
          if (pData && pData.length > 0) {
            setDbProducts(pData);
          }

          // Fetch reviews
          const { data: rData } = await supabase.from('reviews').select('*').eq('status', 'approved');
          if (rData) {
            setDbReviews(rData);
          }

          // Fetch blogs
          const { data: blData } = await supabase.from('blogs').select('*').eq('status', 'published');
          if (blData) {
            setDbBlogs(blData);
          }

          // Fetch banners
          const { data: bData } = await supabase.from('banners').select('*').eq('is_active', true);
          if (bData) {
            setDbBanners(bData);
          }

          // Fetch settings
          const { data: sData } = await supabase.from('settings').select('*').single();
          if (sData) {
            setDbSettings(sData);
            
            // Initialize marketing telemetry (pixels, analytics, GTM)
            initializeTelemetry({
              metaPixelId: sData.meta_pixel_id,
              metaTestEventCode: sData.meta_test_event_code,
              googleTagManagerId: sData.google_tag_manager_id,
              googleAnalyticsId: sData.google_analytics_id
            });
          }
        } catch (e) {
          console.error("Error loading Supabase storefront data:", e);
        }
      }
    };
    loadData();
  }, [isSupabaseOnline]);

  // Telemetry page view tracking
  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    const eventId = generateEventId('PageView');
    trackPageView(path, eventId, dbSettings?.meta_test_event_code);
  }, [activePage, currentProductId, currentBlogId, dbSettings]);

  // Telemetry product view tracking
  useEffect(() => {
    if (activePage === 'product-detail' && currentProductId) {
      const product = PRODUCTS.find(p => p.id === currentProductId);
      if (product) {
        const eventId = generateEventId('ViewContent');
        trackViewContent(product, eventId, dbSettings?.meta_test_event_code);
      }
    }
  }, [activePage, currentProductId, PRODUCTS, dbSettings]);

  // Telemetry checkout start tracking
  useEffect(() => {
    if (activePage === 'checkout' && cart.length > 0) {
      const eventId = generateEventId('InitiateCheckout');
      trackInitiateCheckout(cart, getSubtotal(), eventId, dbSettings?.meta_test_event_code);
    }
  }, [activePage, cart, dbSettings]);

  // Checkout submission
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      alert('Please fill out all required fields to proceed with your delivery.');
      return;
    }

    const purchaseEventId = generateEventId('Purchase');
    const orderId = `RUP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      customerName: checkoutForm.name,
      phone: checkoutForm.phone,
      address: checkoutForm.address,
      area: checkoutForm.area,
      paymentMethod: checkoutForm.paymentMethod,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        color: item.selectedColor,
        size: item.selectedSize,
        price: item.product.discountPrice || item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]
      })),
      subtotal: getSubtotal(),
      shippingFee: getShippingFee(),
      total: getTotal(),
      status: 'Confirmed',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isGuest: currentUser === null,
      isIncognitoGuest: currentUser === null
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('rup_orders', JSON.stringify(updatedOrders));

    // Save order to Supabase if online
    const writeOrderToSupabase = async () => {
      if (isSupabaseOnline) {
        try {
          const { error } = await supabase.from('orders').insert([{
            id: orderId,
            customer_name: checkoutForm.name,
            phone: checkoutForm.phone,
            address: checkoutForm.address,
            area: checkoutForm.area,
            payment_method: checkoutForm.paymentMethod,
            items: newOrder.items,
            subtotal: newOrder.subtotal,
            shipping_fee: newOrder.shippingFee,
            total: newOrder.total,
            status: 'Pending',
            payment_status: 'Unpaid',
            customer_notes: '',
            meta_event_id: purchaseEventId,
            is_guest: currentUser === null
          }]);
          if (error) {
            console.error("Error writing order to Supabase:", error.message);
          }
        } catch (err) {
          console.error("Error writing order to Supabase:", err);
        }
      }
    };
    writeOrderToSupabase();

    // Trigger Telemetry Purchase Event
    trackPurchase(newOrder, purchaseEventId, dbSettings?.meta_test_event_code);

    // Clear cart and reset states
    setLastPlacedOrder(newOrder);
    saveCartToStorage([]);
    setAppliedCoupon(null);
    setCouponCode('');
    setActivePage('order-success');
  };

  // Simulated Order Tracking query
  const handleTrackQuery = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingSearched(true);
    
    const matched = orders.find(
      (o) => o.id.toUpperCase() === trackOrderId.trim().toUpperCase() && o.phone === trackPhone.trim()
    );

    if (matched) {
      setTrackingResult(matched);
    } else {
      setTrackingResult(null);
    }
  };

  // Instant filtered list for Shop/Category Page with advanced attributes
  const getFilteredProducts = () => {
    let filtered = PRODUCTS.filter((p) => {
      // Category filter
      let matchCategory = true;
      if (appliedFilters.categories.length > 0) {
        matchCategory = appliedFilters.categories.includes(p.category);
      } else if (selectedCategory !== 'All') {
        matchCategory = p.category === selectedCategory || 
                        (selectedCategory === 'New Arrivals' && p.isNew) || 
                        (selectedCategory === 'Best Sellers' && p.isBestSeller) || 
                        (selectedCategory === 'Flash Sale' && p.isFlashSale);
      }

      // Gender filter
      const matchGender = selectedGender === 'All' || p.gender === selectedGender;

      // Brand filter
      let matchBrand = true;
      if (appliedFilters.brands.length > 0) {
        const pBrand = p.brand || 'No Brand';
        matchBrand = appliedFilters.brands.includes(pBrand);
      }

      // Price filter
      let matchPrice = true;
      const actualPrice = p.discountPrice || p.price;
      if (appliedFilters.minPrice) {
        matchPrice = matchPrice && actualPrice >= parseFloat(appliedFilters.minPrice);
      }
      if (appliedFilters.maxPrice) {
        matchPrice = matchPrice && actualPrice <= parseFloat(appliedFilters.maxPrice);
      }

      // Stock status filter
      let matchStock = true;
      if (appliedFilters.stock.length > 0) {
        const inStockSelected = appliedFilters.stock.includes('In Stock');
        const outStockSelected = appliedFilters.stock.includes('Out of Stock');
        if (inStockSelected && !outStockSelected) {
          matchStock = p.stock > 0;
        } else if (outStockSelected && !inStockSelected) {
          matchStock = p.stock === 0;
        }
      }

      // Sidebar text search filter
      let matchSearch = true;
      if (appliedFilters.search.trim()) {
        const query = appliedFilters.search.toLowerCase();
        matchSearch = p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
      }

      // Global header search query if present
      let matchGlobalSearch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        matchGlobalSearch = p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
      }

      return matchCategory && matchGender && matchBrand && matchPrice && matchStock && matchSearch && matchGlobalSearch;
    });

    // Handle interactive sorting
    if (sortBy === 'Price: Low to High') {
      filtered = [...filtered].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'Price: High to Low') {
      filtered = [...filtered].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === 'Newest Arrivals') {
      filtered = [...filtered].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (sortBy === 'Popularity') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  };

  // Filter application action triggers
  const handleApplyFilters = () => {
    setAppliedFilters({
      categories: checkedCategories,
      brands: selectedBrands,
      minPrice: minPrice,
      maxPrice: maxPrice,
      stock: selectedStock,
      search: sidebarSearch
    });
  };

  const handleResetFilters = () => {
    setCheckedCategories([]);
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedStock([]);
    setSidebarSearch('');
    setSelectedCategory('All');
    setSelectedGender('All');
    setSearchQuery('');
    setAppliedFilters({
      categories: [],
      brands: [],
      minPrice: '',
      maxPrice: '',
      stock: [],
      search: ''
    });
  };

  // Open Size Guide Utility
  const handleOpenSizeGuide = (category: string) => {
    setSizeGuideCategory(category);
    setSizeGuideOpen(true);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans text-brand-text">
      
      {/* Search overlay component */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div 
            onClick={() => setSearchOpen(false)}
            className="absolute inset-0"
          />
          <div 
            id="search-overlay-content"
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative z-10 animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium Panjabi, Saree, Kurti, Shirts..."
                className="w-full bg-transparent border-none outline-none text-base font-medium placeholder-gray-400 text-brand-text"
                autoFocus
              />
              <button 
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-400 hover:text-brand-text text-sm font-semibold"
              >
                ESC
              </button>
            </div>

            {/* Instant suggested query tags */}
            {searchQuery.trim() === '' ? (
              <div className="space-y-4">
                <span className="block text-xs uppercase font-bold text-gray-400 tracking-wider">Popular Searches</span>
                <div className="flex flex-wrap gap-2">
                  {['Panjabi', 'Couple Collection', 'Saree', 'Fusion Kurti', 'Polo Shirt', 'Oud Perfume'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                      }}
                      className="bg-gray-50 hover:bg-blue-50 hover:text-brand-primary transition-colors text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-100 text-gray-600 cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {PRODUCTS.filter((p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.category.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      setQuickViewProduct(product);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <img
                      src={product.images[0] || undefined}
                      alt={product.name}
                      className="w-12 h-16 object-cover rounded-md"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-brand-text truncate">{product.name}</h4>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">{product.category}</p>
                    </div>
                    <span className="text-sm font-extrabold text-brand-primary">
                      ৳{(product.discountPrice || product.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Premium Navbar Header */}
      <Header
        activePage={activePage}
        onPageChange={navigateTo}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        cartTotal={getSubtotal()}
        wishlistCount={wishlist.length}
        onOpenSearch={() => setSearchOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Page Layout Dispatcher */}
      <main className="flex-1 pb-16 md:pb-0">
        
        {/* ADMIN DASHBOARD */}
        {activePage === 'admin' && (
          <AdminPanel onClose={() => setActivePage('home')} />
        )}
        
        {/* HOMEPAGE */}
        {activePage === 'home' && (
          <div className="bg-gray-50/50 pb-16 space-y-14">
            
            {/* Split Hero Banner (Skincare & Serum Promo) */}
            <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Left Sliding Hero Carousel - 3 columns */}
                <div className="col-span-1 lg:col-span-3 relative rounded-2xl overflow-hidden h-[340px] sm:h-[420px] shadow-sm select-none group">
                  {/* Banner Content Container */}
                  <div className="absolute inset-0 transition-all duration-700 ease-in-out">
                    <img 
                      src={heroBanners[heroSlide].bgUrl} 
                      alt={heroBanners[heroSlide].title}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {/* Dark sleek gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
                    
                    <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between text-white z-10 text-left">
                      <div className="space-y-3.5 max-w-md sm:max-w-lg">
                        <span className="inline-block bg-[#ff5c00] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-sm">
                          {heroBanners[heroSlide].title}
                        </span>
                        <h2 className="font-sans font-black text-2xl sm:text-4xl tracking-tight leading-none uppercase">
                          {heroBanners[heroSlide].highlight}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-200 font-medium tracking-wide">
                          {heroBanners[heroSlide].subtitle}
                        </p>
                        <div className="pt-2">
                          <button 
                            onClick={() => {
                              setSelectedCategory(heroBanners[heroSlide].category);
                              navigateTo('/shop');
                            }}
                            className="bg-white text-[#ff5c00] hover:bg-gray-100 font-extrabold text-[11px] sm:text-xs px-5 py-2.5 rounded-full uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-md"
                          >
                            {heroBanners[heroSlide].ctaText}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono tracking-widest text-white/50">
                        <span>www.borbila.com</span>
                      </div>
                    </div>
                  </div>

                  {/* Indicators / Dot controllers */}
                  <div className="absolute bottom-5 right-5 z-20 flex gap-2">
                    {heroBanners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setHeroSlide(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                          heroSlide === idx ? 'bg-[#ff5c00] w-6' : 'bg-white/50 hover:bg-white'
                        }`}
                        title={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Left & Right Arrow controls on hover */}
                  <button 
                    onClick={() => setHeroSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer text-lg font-bold"
                  >
                    ‹
                  </button>
                  <button 
                    onClick={() => setHeroSlide((prev) => (prev + 1) % heroBanners.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer text-lg font-bold"
                  >
                    ›
                  </button>
                </div>

                {/* Right Luxury Serum Promo Banner - 1 column (hidden on tablet & mobile) */}
                <div className="hidden lg:flex bg-gradient-to-b from-[#ff8c00] to-[#ff5c00] rounded-2xl p-6 flex-col justify-between text-white relative overflow-hidden h-[340px] sm:h-[420px] shadow-sm">
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-sm">Our New Product!</span>
                      <h3 className="font-sans font-black text-xl uppercase tracking-tight">LUXURY SERUM</h3>
                    </div>
                    
                    {/* Image of serum bottle in center */}
                    <div className="flex-1 flex items-center justify-center py-2 pointer-events-none">
                      <img 
                        src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop" 
                        alt="Luxury Serum" 
                        className="h-40 object-contain" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>

                    {/* Small contacts box at bottom to mirror mockup */}
                    <div className="bg-[#cc4a00] p-2.5 rounded-lg border border-white/15 text-[10px] space-y-0.5 font-medium shadow-sm">
                      <p className="flex justify-between"><span>📞 Call:</span> <span>09678 123 456</span></p>
                      <p className="flex justify-between"><span>✉️ Email:</span> <span>support@doraz.com.bd</span></p>
                      <p className="flex justify-between"><span>🌐 Web:</span> <span>www.borbila.com</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Product Categories Section */}
            <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
                <h2 className="font-sans text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
                  Product Categories
                </h2>
                <button 
                  onClick={() => { setSelectedCategory('All'); navigateTo('/shop'); }}
                  className="bg-black text-white hover:bg-gray-800 text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              {/* Grid of 16 categories */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {[
                  { name: 'Women Fashions', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Toys Products', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Power Sanders', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Men Fashions', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Shirts & Polos', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Kitchen Items', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Health Care', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Fitness', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Baby & Kids', image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=150&auto=format&fit=crop' },
                  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=150&auto=format&fit=crop' }
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setSelectedGender('All');
                      navigateTo('/shop');
                    }}
                    className="group bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <span className="text-[11px] font-extrabold text-gray-800 group-hover:text-[#ff5c00] transition-colors mt-2.5 line-clamp-1 uppercase tracking-tight">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Flash Sale Section with Countdown Timer */}
            <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                
                {/* Countdown Header Row */}
                <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ff5c00]/10 flex items-center justify-center text-[#ff5c00] animate-pulse">
                      <Flame className="w-5.5 h-5.5 fill-current" />
                    </div>
                    <div>
                      <h3 className="font-sans font-black text-lg text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        Flash Sale
                      </h3>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Hurry up! Limited time offers</p>
                    </div>
                  </div>

                  {/* Real-time Ticking Countdown Clocks */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mr-1.5 hidden sm:inline">Ends In:</span>
                    <div className="bg-[#ff5c00] text-white font-mono text-sm font-black px-3 py-1.5 rounded-md min-w-[38px] text-center shadow-xs">
                      {String(Math.floor(secondsRemaining / 3600)).padStart(2, '0')}
                    </div>
                    <span className="text-xs font-bold text-gray-400">:</span>
                    <div className="bg-[#ff5c00] text-white font-mono text-sm font-black px-3 py-1.5 rounded-md min-w-[38px] text-center shadow-xs">
                      {String(Math.floor((secondsRemaining % 3600) / 60)).padStart(2, '0')}
                    </div>
                    <span className="text-xs font-bold text-gray-400">:</span>
                    <div className="bg-[#ff5c00] text-white font-mono text-sm font-black px-3 py-1.5 rounded-md min-w-[38px] text-center shadow-xs">
                      {String(secondsRemaining % 60).padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {/* 6 Products Grid */}
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {PRODUCTS.filter((p) => p.isFlashSale).slice(0, 6).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => setQuickViewProduct(p)}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlist.some((w) => w.id === product.id)}
                    />
                  ))}
                </div>

              </div>
            </section>

            {/* Shopmart Big Sale Banner Area */}
            <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="bg-[#ff5c00] rounded-2xl overflow-hidden shadow-md p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-white relative">
                <div className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none" />
                {/* Left luggage mockup */}
                <div className="hidden md:block w-1/4 max-w-[170px] pointer-events-none">
                  <img src="https://images.unsplash.com/photo-1565026057447-bc90a3dca487?q=80&w=400&auto=format&fit=crop" alt="Bag Luggage Combo" className="w-full object-contain" referrerPolicy="no-referrer" />
                </div>

                {/* Middle Text and CTA */}
                <div className="flex-1 text-center space-y-3.5 px-4 relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/25 px-3.5 py-1 rounded-full">Shopmart Promo</span>
                  <h2 className="font-sans font-black text-3xl md:text-5xl uppercase tracking-tighter leading-none">BIG SALE</h2>
                  <div className="inline-block bg-black text-white text-[11px] font-black px-4.5 py-1.5 rounded-full tracking-wide">
                    UP TO 70% OFF
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-white/90 tracking-wide uppercase">
                    Fashion • Electronics • Beauty • Home • Grocery
                  </p>
                  <button 
                    onClick={() => { setSelectedCategory('All'); navigateTo('/shop'); }} 
                    className="bg-white text-[#ff5c00] hover:bg-gray-100 font-extrabold text-xs px-8 py-3 rounded-full uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    SHOP NOW
                  </button>
                </div>

                {/* Right electronic appliance mockup */}
                <div className="hidden md:block w-1/4 max-w-[170px] pointer-events-none">
                  <img src="https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=400&auto=format&fit=crop" alt="Home Blender Appliances" className="w-full object-contain" referrerPolicy="no-referrer" />
                </div>
              </div>
            </section>

            {/* Featured Products Section */}
            <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
                <h2 className="font-sans text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
                  Featured Products
                </h2>
                <button 
                  onClick={() => { setSelectedCategory('New Arrivals'); navigateTo('/shop'); }}
                  className="bg-black text-white hover:bg-gray-800 text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {PRODUCTS.filter((p) => p.isFeatured).slice(0, 6).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.some((w) => w.id === product.id)}
                  />
                ))}
              </div>
            </section>

            {/* Recent Products Section (18 products!) */}
            <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
                <h2 className="font-sans text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
                  Recent Products
                </h2>
                <button 
                  onClick={() => { setSelectedCategory('All'); navigateTo('/shop'); }}
                  className="bg-black text-white hover:bg-gray-800 text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              {/* 3 rows of 6 products */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {PRODUCTS.slice(0, 18).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.some((w) => w.id === product.id)}
                  />
                ))}
              </div>
            </section>

            {/* Most Selling Products Section */}
            <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
                <h2 className="font-sans text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
                  Most Selling Products
                </h2>
                <button 
                  onClick={() => { setSelectedCategory('Best Sellers'); navigateTo('/shop'); }}
                  className="bg-black text-white hover:bg-gray-800 text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {PRODUCTS.filter((p) => p.isBestSeller).slice(0, 6).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.some((w) => w.id === product.id)}
                  />
                ))}
              </div>
            </section>

            {/* Value Props trust elements section */}
            <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-2xs">
                <div className="flex items-center gap-4 border-r border-gray-100/70 last:border-0 pr-4">
                  <div className="p-3.5 bg-orange-50 rounded-xl text-[#ff5c00] shrink-0">
                    <Truck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 tracking-tight text-left">FAST DELIVERY</h4>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium text-left">Free shipping over 5000Tk</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 border-r border-gray-100/70 last:border-0 pr-4">
                  <div className="p-3.5 bg-orange-50 rounded-xl text-[#ff5c00] shrink-0">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 tracking-tight text-left">AUTHORIZED PRODUCTS</h4>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium text-left">100% Genuine Brands Guaranteed</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 border-r border-gray-100/70 last:border-0 pr-4">
                  <div className="p-3.5 bg-orange-50 rounded-xl text-[#ff5c00] shrink-0">
                    <RotateCcw className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 tracking-tight text-left">7-DAY REPLACEMENTS</h4>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium text-left">Within 30 days for an exchange</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-orange-50 rounded-xl text-[#ff5c00] shrink-0">
                    <HelpCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 tracking-tight text-left">CUSTOMER SUPPORT</h4>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium text-left">24/7 Helpline & Live Chat</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Blogs & News Section */}
            <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
                <h2 className="font-sans text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
                  Blogs & News
                </h2>
                <button 
                  onClick={() => navigateTo('/blog')}
                  className="bg-black text-white hover:bg-gray-800 text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {BLOGS.slice(0, 3).map((blog) => (
                  <article 
                    key={blog.id}
                    onClick={() => {
                      setCurrentBlogId(blog.id);
                      navigateTo(`/blog?id=${blog.id}`);
                    }}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col group"
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-50">
                      <img 
                        src={blog.image} 
                        alt={blog.title} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                        referrerPolicy="no-referrer" 
                      />
                      <span className="absolute top-3 left-3 bg-[#ff5c00] text-white text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-xs">
                        BLOGS
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-sans font-extrabold text-sm text-gray-900 group-hover:text-[#ff5c00] transition-colors leading-snug line-clamp-2 uppercase text-left">
                          {blog.title}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed text-left">
                          {blog.excerpt}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span>{blog.date}</span>
                        <span className="text-[#ff5c00] group-hover:underline flex items-center gap-1 font-extrabold">
                          READ MORE »
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* SHOP PAGE / CATEGORY FILTER SCREEN */}
        {activePage === 'shop' && (
          <div className="w-full bg-[#f4f6f8] min-h-screen font-sans pb-16">
            
            {/* Peach Header */}
            <div className="bg-[#fff1eb] w-full py-10 text-center border-b border-gray-100 mb-8">
              <h1 className="font-sans font-black text-3xl tracking-tight text-gray-900">Shop</h1>
            </div>

            {/* 2-Column Filtering & Store Setup */}
            <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col lg:flex-row gap-8">
              
              {/* Left Column: Filter Sidebar */}
              <div className="w-full lg:w-68 space-y-5 shrink-0">
                
                {/* Search Products Sidebar Box */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs">
                  <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-3">Search Products</h3>
                  <div className="flex rounded-md border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-[#ff5c00] focus-within:border-[#ff5c00]">
                    <input 
                      type="text"
                      placeholder="Find your product..."
                      value={sidebarSearch}
                      onChange={(e) => setSidebarSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleApplyFilters();
                      }}
                      className="flex-1 min-w-0 px-3 py-2 text-xs text-gray-800 outline-none placeholder-gray-400"
                    />
                    <button 
                      onClick={handleApplyFilters}
                      className="bg-[#111827] hover:bg-black text-white px-3.5 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sidebar Filter Container */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Filter Options</h3>
                    <button
                      onClick={handleResetFilters}
                      className="text-xs font-bold text-[#ff5c00] hover:underline cursor-pointer"
                    >
                      Reset All
                    </button>
                  </div>

                  {/* Categories Collapsible */}
                  <div className="space-y-3">
                    <button 
                      onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <span className="text-xs uppercase font-extrabold text-gray-900 tracking-wider">Categories</span>
                      <span className="w-5 h-5 bg-[#ffece2] rounded-full flex items-center justify-center text-[#ff5c00] text-xs font-black select-none">
                        {categoriesExpanded ? '−' : '+'}
                      </span>
                    </button>
                    
                    {categoriesExpanded && (
                      <div className="space-y-2.5 pt-1">
                        {Array.from(new Set(PRODUCTS.map(p => p.category).filter(Boolean))).map((cat) => {
                          const count = PRODUCTS.filter(p => p.category === cat).length;
                          const isChecked = checkedCategories.includes(cat);
                          return (
                            <label key={cat} className="flex items-center justify-between group cursor-pointer text-sm">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setCheckedCategories(prev => 
                                      isChecked ? prev.filter(c => c !== cat) : [...prev, cat]
                                    );
                                  }}
                                  className="w-4 h-4 rounded border-gray-300 text-[#ff5c00] focus:ring-[#ff5c00] focus:ring-opacity-25 focus:ring-offset-0 accent-[#ff5c00]"
                                />
                                <span className={`text-xs font-medium text-gray-700 group-hover:text-black transition-colors ${isChecked ? 'text-gray-950 font-bold' : ''}`}>
                                  {cat}
                                </span>
                              </div>
                              <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Brand Collapsible */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <button 
                      onClick={() => setBrandExpanded(!brandExpanded)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <span className="text-xs uppercase font-extrabold text-gray-900 tracking-wider">Brand</span>
                      <span className="w-5 h-5 bg-[#ffece2] rounded-full flex items-center justify-center text-[#ff5c00] text-xs font-black select-none">
                        {brandExpanded ? '−' : '+'}
                      </span>
                    </button>

                    {brandExpanded && (
                      <div className="space-y-2.5 pt-1">
                        {['Apex', 'No Brand', 'Ruposhi', 'Sports Vision'].map((brand) => {
                          const count = PRODUCTS.filter(p => (p.brand || 'No Brand') === brand).length;
                          const isChecked = selectedBrands.includes(brand);
                          return (
                            <label key={brand} className="flex items-center justify-between group cursor-pointer text-sm">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setSelectedBrands(prev => 
                                      isChecked ? prev.filter(b => b !== brand) : [...prev, brand]
                                    );
                                  }}
                                  className="w-4 h-4 rounded border-gray-300 text-[#ff5c00] focus:ring-[#ff5c00] focus:ring-opacity-25 accent-[#ff5c00]"
                                />
                                <span className={`text-xs font-medium text-gray-700 group-hover:text-black transition-colors ${isChecked ? 'text-gray-955 font-bold text-gray-950' : ''}`}>
                                  {brand}
                                </span>
                              </div>
                              <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Price Range Collapsible */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <button 
                      onClick={() => setPriceExpanded(!priceExpanded)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <span className="text-xs uppercase font-extrabold text-gray-900 tracking-wider">Price Range</span>
                      <span className="w-5 h-5 bg-[#ffece2] rounded-full flex items-center justify-center text-[#ff5c00] text-xs font-black select-none">
                        {priceExpanded ? '−' : '+'}
                      </span>
                    </button>

                    {priceExpanded && (
                      <div className="pt-1 space-y-2.5">
                        <div className="flex items-center gap-2">
                          {/* Min Price */}
                          <div className="relative flex-1 rounded-md border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-[#ff5c00] focus-within:border-[#ff5c00]">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">৳</span>
                            <input
                              type="number"
                              placeholder="Min"
                              value={minPrice}
                              onChange={(e) => setMinPrice(e.target.value)}
                              className="w-full pl-6 pr-2 py-1.5 text-xs outline-none bg-white text-gray-800 placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                          
                          <span className="text-gray-400 text-xs">−</span>
                          
                          {/* Max Price */}
                          <div className="relative flex-1 rounded-md border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-[#ff5c00] focus-within:border-[#ff5c00]">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">৳</span>
                            <input
                              type="number"
                              placeholder="Max"
                              value={maxPrice}
                              onChange={(e) => setMaxPrice(e.target.value)}
                              className="w-full pl-6 pr-2 py-1.5 text-xs outline-none bg-white text-gray-800 placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stock Status Collapsible */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <button 
                      onClick={() => setStockExpanded(!stockExpanded)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <span className="text-xs uppercase font-extrabold text-gray-900 tracking-wider">Stock Status</span>
                      <span className="w-5 h-5 bg-[#ffece2] rounded-full flex items-center justify-center text-[#ff5c00] text-xs font-black select-none">
                        {stockExpanded ? '−' : '+'}
                      </span>
                    </button>

                    {stockExpanded && (
                      <div className="space-y-2.5 pt-1">
                        {['In Stock', 'Out of Stock'].map((status) => {
                          const count = status === 'In Stock' 
                            ? PRODUCTS.filter(p => p.stock > 0).length
                            : PRODUCTS.filter(p => p.stock === 0).length;
                          const isChecked = selectedStock.includes(status);
                          return (
                            <label key={status} className="flex items-center justify-between group cursor-pointer text-sm">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setSelectedStock(prev => 
                                      isChecked ? prev.filter(s => s !== status) : [...prev, status]
                                    );
                                  }}
                                  className="w-4 h-4 rounded border-gray-300 text-[#ff5c00] focus:ring-[#ff5c00] focus:ring-opacity-25 accent-[#ff5c00]"
                                />
                                <span className={`text-xs font-medium text-gray-700 group-hover:text-black transition-colors ${isChecked ? 'text-gray-955 font-bold text-gray-950' : ''}`}>
                                  {status}
                                </span>
                              </div>
                              <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="border-t border-gray-100 pt-5 space-y-2.5">
                    <button
                      onClick={handleApplyFilters}
                      className="w-full bg-[#ff5c00] hover:bg-[#e04f00] text-white text-xs font-bold py-2.5 px-4 rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      Apply Filter
                    </button>
                    <button
                      onClick={handleResetFilters}
                      className="w-full text-center text-xs font-bold text-gray-500 hover:text-black py-1.5 transition-colors cursor-pointer"
                    >
                      Reset All
                    </button>
                  </div>

                </div>
              </div>

              {/* Right Column: Products list */}
              <div className="flex-1 space-y-4">
                
                {/* Product Count Indicator & Sorting */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs text-gray-500 py-1">
                  <div>
                    Showing <strong>{getFilteredProducts().length}</strong> premium items
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">Sort By:</span>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent font-bold text-[#ff5c00] outline-none cursor-pointer border-none text-xs focus:ring-0"
                      >
                        <option value="Popularity">Popularity</option>
                        <option value="Newest Arrivals">Newest Arrivals</option>
                        <option value="Price: Low to High">Price: Low to High</option>
                        <option value="Price: High to Low">Price: High to Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                {getFilteredProducts().length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {getFilteredProducts().map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlist.some((w) => w.id === product.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center space-y-4 shadow-2xs">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                    <h3 className="font-sans font-bold text-lg text-gray-900 uppercase">No products matched</h3>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                      We currently do not have matching items under the specified sidebar filter configuration. Try resetting some filters or search query!
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="bg-[#ff5c00] hover:bg-[#e04f00] text-white font-bold text-xs px-5 py-2.5 rounded-md cursor-pointer transition-colors shadow-xs"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* SHOPPING CART PAGE */}
        {activePage === 'cart' && (
          <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 py-12 space-y-10">
            <h1 className="font-display text-3xl font-extrabold text-brand-text uppercase tracking-tight">
              My Shopping Bag ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </h1>

            {cart.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Item List (2 cols on desktop) */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 shadow-xs items-center relative"
                    >
                      <img
                        src={item.product.images[0] || undefined}
                        alt={item.product.name}
                        className="w-20 h-24 object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-sm md:text-base text-brand-text truncate">
                          {item.product.name}
                        </h4>
                        
                        {/* selected configurations */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 font-medium">
                          <span>Size: <strong className="text-brand-text">{item.selectedSize}</strong></span>
                          <span className="flex items-center gap-1">
                            Color: <strong className="text-brand-text">{item.selectedColor}</strong>
                          </span>
                        </div>

                        {/* pricing calculation */}
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-base font-extrabold text-brand-primary">
                            ৳{(item.product.discountPrice || item.product.price).toLocaleString('en-IN')}
                          </span>
                          {item.product.discountPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ৳{item.product.price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* quantity adjustments */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleUpdateCartQty(index, item.quantity - 1)}
                            className="w-7 h-7 bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-500 rounded-md cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateCartQty(index, item.quantity + 1)}
                            className="w-7 h-7 bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-500 rounded-md cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* delete cross */}
                      <button
                        onClick={() => handleUpdateCartQty(index, 0)}
                        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Right: Summary panel */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs h-fit space-y-6">
                  <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-text border-b border-gray-100 pb-3">
                    Order Summary
                  </h3>

                  {/* Coupon entry form */}
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <span className="block text-xs uppercase font-bold text-gray-400">Apply coupon code</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. RUPAN20"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-primary font-mono"
                      />
                      <button
                        type="submit"
                        className="bg-brand-primary text-white font-bold text-xs px-4 rounded-xl hover:bg-blue-900 transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      * Enter "RUPAN20" for 20% flat discount on total purchase price!
                    </p>
                  </form>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3.5 text-sm font-medium border-t border-gray-100 pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-brand-text">৳{getSubtotal().toLocaleString('en-IN')}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>- ৳{getDiscountAmount().toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-500">Nationwide Shipping Fee</span>
                      <span className="text-brand-text">
                        {getShippingFee() === 0 ? (
                          <span className="text-emerald-600 font-bold">FREE</span>
                        ) : (
                          `৳${getShippingFee()}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-3 text-brand-primary">
                      <span>Grand Total</span>
                      <span>৳{getTotal().toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActivePage('checkout')}
                    className="w-full bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm py-3.5 rounded-xl text-center shadow-md hover:shadow-lg transition-all cursor-pointer block mt-4"
                  >
                    Proceed To Delivery Checkout
                  </button>
                  
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 font-medium">
                      🔒 256-Bit SSL Encrypted Nationwide Transactions
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center space-y-4 max-w-md mx-auto">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
                <h3 className="font-display text-lg font-bold uppercase text-brand-text">Your bag is empty</h3>
                <p className="text-sm text-gray-500">
                  You haven't added any products to your cart yet. Explore our latest festival and western arrivals to style your wardrobe.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setActivePage('shop');
                  }}
                  className="bg-brand-primary hover:bg-blue-900 text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        )}

        {/* CHECKOUT PAGE (MINIMAL, CONVERSION ORIENTED) */}
        {activePage === 'checkout' && (
          <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 py-12 space-y-10">
            {/* Checkout Progress Indicator */}
            <div className="flex items-center justify-center gap-2 max-w-md mx-auto mb-10 text-xs font-bold uppercase text-gray-400">
              <span className="text-brand-primary">1. Shopping Bag</span>
              <span className="h-0.5 w-10 bg-brand-primary" />
              <span className="text-brand-primary">2. Delivery Info</span>
              <span className="h-0.5 w-10 bg-gray-200" />
              <span>3. Order Complete</span>
            </div>

            {/* Incognito Guest Checkout Reassurance Banner */}
            {currentUser === null && (
              <div className="max-w-4xl mx-auto bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 flex items-start gap-4 shadow-xs animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600 font-extrabold text-xl shrink-0">
                  🕶️
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-xs sm:text-sm font-extrabold text-orange-950 uppercase tracking-wide flex items-center gap-2">
                    Incognito Guest Checkout Enabled
                  </h4>
                  <p className="text-[11px] sm:text-xs text-orange-800 leading-relaxed font-semibold">
                    You are placing this order as a guest without creating an account. Once checked out, you can securely track your delivery in real-time on our <strong className="text-[#ff5c00] underline cursor-pointer hover:text-[#e04f00]" onClick={() => navigateTo('track-order')}>Track Order</strong> page simply by entering your <span className="underline font-bold">Phone Number</span> and <span className="underline font-bold">Order ID</span>.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Checkout Input Form */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-xs space-y-6">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide text-brand-text pb-3 border-b border-gray-100">
                  Shipping & Delivery Information
                </h2>

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-gray-500">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                      placeholder="e.g. Sajid Al-Hasan"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans"
                    />
                  </div>

                  {/* Phone & Email Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-bold text-gray-500">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={checkoutForm.phone}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                        placeholder="e.g. 01712345678"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-bold text-gray-500">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={checkoutForm.email}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                        placeholder="e.g. customer@gmail.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-gray-500">Detailed Delivery Address *</label>
                    <textarea
                      required
                      rows={3}
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      placeholder="e.g. House No. 12, Road No. 3, Sector 4, Uttara, Dhaka"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans resize-none"
                    />
                  </div>

                  {/* Delivery Location Area Selector */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, area: 'Inside Dhaka' })}
                      className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase border transition-all cursor-pointer text-center ${
                        checkoutForm.area === 'Inside Dhaka'
                          ? 'bg-blue-50 border-brand-primary text-brand-primary shadow-xs'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      🛵 Inside Dhaka
                      <span className="block text-[10px] text-gray-400 font-semibold mt-1">Delivery Charge: ৳60</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, area: 'Outside Dhaka' })}
                      className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase border transition-all cursor-pointer text-center ${
                        checkoutForm.area === 'Outside Dhaka'
                          ? 'bg-blue-50 border-brand-primary text-brand-primary shadow-xs'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      🚚 Outside Dhaka
                      <span className="block text-[10px] text-gray-400 font-semibold mt-1">Delivery Charge: ৳120</span>
                    </button>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-3 pt-5 border-t border-gray-100">
                    <label className="text-xs uppercase font-bold text-gray-500 block mb-2">Choose Payment Method *</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: Truck },
                        { id: 'bKash Wallet', label: 'bKash Instant Pay', icon: CreditCard },
                        { id: 'Nagad Wallet', label: 'Nagad Instant Pay', icon: CreditCard }
                      ].map((pay) => (
                        <button
                          key={pay.id}
                          type="button"
                          onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: pay.id })}
                          className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase border transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1.5 ${
                            checkoutForm.paymentMethod === pay.id
                              ? 'bg-blue-50 border-brand-primary text-brand-primary shadow-xs'
                              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                          }`}
                        >
                          <pay.icon className="w-5 h-5" />
                          <span>{pay.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm py-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all cursor-pointer block mt-6"
                  >
                    Confirm Nationwide Order ৳{getTotal().toLocaleString('en-IN')}
                  </button>

                </form>
              </div>

              {/* Checkout Summary panel */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs h-fit space-y-6">
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-text border-b border-gray-100 pb-3">
                  In Your Bag
                </h3>

                <div className="divide-y divide-gray-100 max-h-[250px] overflow-y-auto">
                  {cart.map((item, i) => (
                    <div key={i} className="py-3 flex gap-3">
                      <img
                        src={item.product.images[0] || undefined}
                        alt={item.product.name}
                        className="w-10 h-12 object-cover rounded-md shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-brand-text truncate">{item.product.name}</h4>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {item.selectedSize} / {item.selectedColor} • Qty {item.quantity}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-brand-primary shrink-0">
                        ৳{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-xs font-semibold pt-4 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>৳{getSubtotal().toLocaleString('en-IN')}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>- ৳{getDiscountAmount().toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping Delivery</span>
                    <span>{getShippingFee() === 0 ? 'FREE' : `৳${getShippingFee()}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-brand-primary border-t border-gray-100 pt-3">
                    <span>Total Cost</span>
                    <span>৳{getTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50 space-y-2 text-xs">
                  <span className="font-bold text-brand-primary uppercase block">7-DAY DOORSTEP EXCHANGE</span>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Try the garments in comfort at your own home. If you have any sizing issue, we schedule free pick-up exchanges within Dhaka and flat 7-days anywhere else.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ORDER SUCCESS PAGE */}
        {activePage === 'order-success' && lastPlacedOrder && (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
            <span className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full">
              <CheckCircle className="w-10 h-10" />
            </span>
            <div className="space-y-2">
              <h1 className="font-display text-2xl md:text-3xl font-extrabold uppercase text-brand-text">
                Your Order has been Placed!
              </h1>
              <p className="text-sm text-gray-500">
                Alhamdulillah! Thank you for choosing Shop Mart. We have registered your delivery request and are currently packing your items.
              </p>
            </div>

            {/* Order specifications card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs text-left divide-y divide-gray-100 space-y-4">
              <div className="flex justify-between pb-3 text-sm">
                <div>
                  <span className="block text-xs text-gray-400 font-semibold uppercase">Order ID</span>
                  <strong className="text-brand-primary font-mono text-base">{lastPlacedOrder.id}</strong>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-gray-400 font-semibold uppercase">Est. Delivery</span>
                  <strong className="text-brand-text">1-3 Working Days</strong>
                </div>
              </div>

              <div className="py-3 text-xs space-y-2">
                <span className="block font-bold text-gray-400 uppercase">Shipping Details</span>
                <p className="text-gray-700"><strong>Name:</strong> {lastPlacedOrder.customerName}</p>
                <p className="text-gray-700"><strong>Phone:</strong> {lastPlacedOrder.phone}</p>
                <p className="text-gray-700"><strong>Address:</strong> {lastPlacedOrder.address}</p>
                <p className="text-gray-700"><strong>Method:</strong> {lastPlacedOrder.paymentMethod}</p>
              </div>

              <div className="pt-3 flex justify-between text-sm font-bold text-brand-primary">
                <span>Amount Payable</span>
                <span>৳{lastPlacedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-4">
              <button
                onClick={() => {
                  setTrackOrderId(lastPlacedOrder.id);
                  setTrackPhone(lastPlacedOrder.phone);
                  setTrackingResult(lastPlacedOrder);
                  setTrackingSearched(true);
                  setActivePage('track-order');
                }}
                className="w-full sm:w-auto bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm px-6 py-3 rounded-xl cursor-pointer"
              >
                Track My Delivery Status
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setActivePage('shop');
                }}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-600 font-bold text-sm px-6 py-3 border border-gray-200 rounded-xl cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {/* ORDER TRACKING TIMELINE SCREEN */}
        {activePage === 'track-order' && (
          <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block">
                Delivery Tracker
              </span>
              <h1 className="font-display text-3xl font-extrabold text-brand-text uppercase">
                Track Your Delivery Status
              </h1>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Enter your Order ID (e.g. RUP-9524) and Phone Number to inspect your delivery timeline.
              </p>
              
              <div className="flex justify-center pt-2">
                {isSupabaseOnline ? (
                  <button 
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-widest border border-emerald-200 shadow-sm"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </button>
                ) : (
                  <button 
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold bg-gray-100 text-gray-700 uppercase tracking-widest border border-gray-200 shadow-sm"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                    Offline
                  </button>
                )}
              </div>
            </div>

            {/* Tracking Search Form */}
            <form onSubmit={handleTrackQuery} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1.5 w-full">
                <label className="text-xs uppercase font-bold text-gray-500">Order ID *</label>
                <input
                  type="text"
                  required
                  value={trackOrderId}
                  onChange={(e) => setTrackOrderId(e.target.value)}
                  placeholder="e.g. RUP-9524"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-mono"
                />
              </div>
              <div className="flex-1 space-y-1.5 w-full">
                <label className="text-xs uppercase font-bold text-gray-500">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={trackPhone}
                  onChange={(e) => setTrackPhone(e.target.value)}
                  placeholder="e.g. 01711223344"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer"
              >
                Track Now
              </button>
            </form>

            {/* Tracking Results Visual Timeline */}
            {trackingSearched && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-xs space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {trackingResult ? (
                  <>
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">CURRENT STATUS</span>
                        <h3 className="font-display text-lg font-bold text-brand-primary uppercase">
                          {trackingResult.status}
                        </h3>
                      </div>
                      <div className="text-left md:text-right text-xs">
                        <p className="text-gray-400">Order ID: <strong className="text-brand-text font-mono">{trackingResult.id}</strong></p>
                        <p className="text-gray-400">Customer: <strong className="text-brand-text">{trackingResult.customerName}</strong></p>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="relative pt-6 max-w-md mx-auto">
                      
                      {/* Vertical Line */}
                      <div className="absolute left-4 top-10 bottom-10 w-0.5 bg-gray-200" />

                      {/* States */}
                      {[
                        { name: 'Confirmed', label: 'Order Confirmed', desc: 'Shop Mart sales representative verified your order.' },
                        { name: 'Packed', label: 'Packed & Dispatched', desc: 'Garments carefully packed and handed to Pathao Logistics.' },
                        { name: 'Shipped', label: 'Shipped', desc: 'Package left Dhaka main dispatch warehouse.' },
                        { name: 'Out for Delivery', label: 'Out for Delivery', desc: 'Courier agent is arriving at your doorstep.' },
                        { name: 'Delivered', label: 'Delivered', desc: 'Successfully received & paid by cash/wallet.' }
                      ].map((step, i) => {
                        const statusWeights = { Confirmed: 1, Packed: 2, Shipped: 3, 'Out for Delivery': 4, Delivered: 5 };
                        const currentWeight = statusWeights[trackingResult.status];
                        const stepWeight = statusWeights[step.name as keyof typeof statusWeights];
                        const isDone = stepWeight <= currentWeight;
                        const isCurrent = step.name === trackingResult.status;

                        return (
                          <div key={i} className="flex gap-4 items-start mb-6 last:mb-0 relative z-10">
                            {/* Dot indicator */}
                            <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                              isCurrent 
                                ? 'bg-brand-primary text-white scale-110 ring-4 ring-blue-100'
                                : isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {i + 1}
                            </div>
                            
                            {/* Text Description */}
                            <div className="space-y-0.5">
                              <h4 className={`text-sm font-bold uppercase tracking-wide ${
                                isCurrent ? 'text-brand-primary' : isDone ? 'text-emerald-700' : 'text-gray-400'
                              }`}>
                                {step.label}
                              </h4>
                              <p className="text-xs text-gray-500 leading-normal">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Helpline contact for tracking */}
                    <div className="bg-gray-50 p-4 rounded-xl text-center text-xs text-gray-500">
                      <span>Any questions or delayed delivery? Call helpline: <strong>+8801700000000</strong></span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <MapPin className="w-10 h-10 text-red-500 mx-auto" />
                    <h4 className="font-display font-bold text-brand-text uppercase">No Shipment Record Found</h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      We couldn't locate any active delivery matched with Order ID <strong>{trackOrderId}</strong> and phone <strong>{trackPhone}</strong>. Please check your spelling and try again.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* WISHLIST SCREEN */}
        {activePage === 'wishlist' && (
          <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 py-12 space-y-10">
            <h1 className="font-display text-3xl font-extrabold text-brand-text uppercase tracking-tight">
              My Saved Wishlist ({wishlist.length})
            </h1>

            {wishlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlist.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={true}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center space-y-4 max-w-md mx-auto animate-in fade-in duration-300">
                <Heart className="w-16 h-16 text-gray-300 mx-auto" />
                <h3 className="font-display text-lg font-bold uppercase text-brand-text">Your Wishlist is Empty</h3>
                <p className="text-sm text-gray-500">
                  Save your favorite styles here during browsing to check back, buy or wait for seasonal festival price cuts.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setActivePage('shop');
                  }}
                  className="bg-brand-primary hover:bg-blue-900 text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            )}
          </div>
        )}

        {/* ABOUT US PAGE */}
        {activePage === 'about-us' && (
          <div className="max-w-6xl mx-auto px-4 py-12 space-y-16 text-left animate-in fade-in duration-300">
            {/* Elegant Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-black text-white p-8 md:p-16 flex flex-col justify-center min-h-[350px]">
              <div className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200')" }}></div>
              <div className="relative z-10 space-y-4 max-w-2xl">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff5c00]">Our Legacy & Spirit</span>
                <h1 className="font-display text-4xl md:text-5xl font-black uppercase leading-tight">
                  Crafting the Future of <span className="text-[#ff5c00]">Bangladeshi Style</span>
                </h1>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed font-medium">
                  We are a premium lifestyle fashion brand engineered with elite Bangladeshi craftsmanship, durable climate-resilient fabrics, and contemporary fit excellence.
                </p>
              </div>
            </div>

            {/* Core Pillars / Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl">✨</div>
                <h3 className="font-display text-lg font-black text-gray-900 uppercase">Premium Selection</h3>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-semibold">
                  Every thread in our Royal Jacquard Panjabis, combed cotton T-Shirts, and couple matching sets is rigorously quality-checked for high thread-density durability.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl">🧵</div>
                <h3 className="font-display text-lg font-black text-gray-900 uppercase">Tailored Fit</h3>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-semibold">
                  Specifically tailored to fit Bangladeshi builds. Comfortable shoulder drop, breathable cotton chest contours, and flawless double-stitched durability.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl">🚚</div>
                <h3 className="font-display text-lg font-black text-gray-900 uppercase">Hassle-Free Exchanges</h3>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-semibold">
                  We want you to dress with perfect confidence. That is why we provide a unique doorstep exchange program across all major regions in Bangladesh.
                </p>
              </div>
            </div>

            {/* Story & Heritage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#ff5c00] block">The Shop Mart Mission</span>
                <h2 className="font-display text-3xl font-black text-gray-900 uppercase leading-snug">
                  Uncompromising Quality For The Trendsetters
                </h2>
                <div className="text-sm text-gray-600 space-y-4 leading-relaxed font-semibold">
                  <p>
                    Established with a single mission to eliminate low-quality fashion alternatives, Shop Mart has risen to become Bangladesh’s premier household brand for high-street, ethnic, and western styles.
                  </p>
                  <p>
                    From weavers in Tangail to specialized tailoring factories in Dhaka, we combine localized traditional craftsmanship with clean, high-street minimalist designs. Our collection is curated with ultimate premium prestige.
                  </p>
                </div>
                <div className="flex gap-6 pt-2">
                  <div>
                    <h4 className="text-3xl font-black text-[#ff5c00]">100K+</h4>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Happy Wardrobes</p>
                  </div>
                  <div className="border-l border-gray-100 pl-6">
                    <h4 className="text-3xl font-black text-[#ff5c00]">50+</h4>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Master Craftsmen</p>
                  </div>
                  <div className="border-l border-gray-100 pl-6">
                    <h4 className="text-3xl font-black text-[#ff5c00]">100%</h4>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Pure Combed Cotton</p>
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-md">
                <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000" alt="Tailoring Craft" className="w-full h-[380px] object-cover" />
              </div>
            </div>
          </div>
        )}

        {/* CONTACT US PAGE */}
        {activePage === 'contact-us' && (
          <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 text-left animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#ff5c00] uppercase tracking-widest block">We Are Here For You</span>
              <h1 className="font-display text-3xl font-extrabold text-gray-900 uppercase">Contact Our Support Hub</h1>
              <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">
                Have questions about fits, active shipments, or doorstep exchanges? Reach out directly.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Interactive Contact Form (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-2xs space-y-6">
                <h3 className="font-display text-lg font-black text-gray-900 uppercase border-b border-gray-100 pb-3">
                  Send Us A Message
                </h3>

                {contactSuccess ? (
                  <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl border border-emerald-100 text-center space-y-4">
                    <div className="text-3xl">🎉</div>
                    <h4 className="font-bold text-base uppercase">Message Sent Successfully!</h4>
                    <p className="text-xs leading-relaxed font-semibold">
                      Thank you for contacting Shop Mart. Your inquiry has been logged, and our customer support representative will reach out to you via email or phone within 2 hours.
                    </p>
                    <button
                      onClick={() => setContactSuccess(false)}
                      className="bg-[#ff5c00] text-white text-xs font-extrabold px-4 py-2 rounded-md uppercase tracking-wider cursor-pointer hover:bg-black transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsSubmittingContact(true);
                      setTimeout(() => {
                        setIsSubmittingContact(false);
                        setContactSuccess(true);
                        setContactName('');
                        setContactEmail('');
                        setContactPhone('');
                        setContactSubject('');
                        setContactMessage('');
                      }, 1200);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold text-gray-400">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Your full name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold text-gray-400">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="Your email address"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold text-gray-400">Phone Number *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 017XXXXXXXX"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold text-gray-400">Subject *</label>
                        <input
                          type="text"
                          required
                          placeholder="Topic of discussion"
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-extrabold text-gray-400">Message / Inquiry *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Write your detailed inquiry..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingContact}
                      className="w-full bg-[#ff5c00] hover:bg-black text-white font-extrabold text-xs py-3.5 rounded-lg tracking-wider uppercase transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingContact ? 'SUBMITTING MESSAGE...' : 'SUBMIT MESSAGE'}
                    </button>
                  </form>
                )}
              </div>

              {/* Right Column: Direct details (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Info Card */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="font-display text-base font-black text-gray-900 uppercase">
                    Direct Contact Lines
                  </h3>
                  
                  <div className="space-y-3.5 text-xs font-semibold text-gray-600">
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-[#ff5c00] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-900 font-extrabold">Helpline Number</p>
                        <p className="text-sm font-black text-[#ff5c00] mt-0.5">09678 123 456 (9 AM - 10 PM)</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-4 h-4 text-[#ff5c00] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-900 font-extrabold">WhatsApp Support</p>
                        <p className="text-xs font-black text-brand-primary mt-0.5 hover:underline">
                          <a href="https://wa.me/8801700000000" target="_blank" rel="noopener noreferrer">+880 1700 000000</a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#ff5c00] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-900 font-extrabold">Corporate HQ</p>
                        <p className="leading-relaxed">House-23, Road-12, Dhanmondi, Dhaka-1209, Bangladesh</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flagship Outlets Card */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="font-display text-base font-black text-gray-900 uppercase">
                    Flagship Outlets
                  </h3>

                  <div className="space-y-3 text-xs leading-relaxed font-semibold text-gray-600">
                    <div className="border-b border-gray-200/60 pb-2">
                      <p className="text-gray-950 font-extrabold uppercase">Dhanmondi Outlet</p>
                      <p>Mimi Plaza, 2nd Floor, Road 27, Dhanmondi, Dhaka</p>
                      <p className="text-[10px] text-gray-400 font-bold">Hours: 10:00 AM - 9:30 PM (Weekly Off: Tuesday)</p>
                    </div>
                    <div className="border-b border-gray-200/60 pb-2">
                      <p className="text-gray-950 font-extrabold uppercase">Banani Outlet</p>
                      <p>Road-11, House-45, Block-F, Banani, Dhaka</p>
                      <p className="text-[10px] text-gray-400 font-bold">Hours: 10:00 AM - 9:30 PM (Weekly Off: Wednesday)</p>
                    </div>
                    <div>
                      <p className="text-gray-950 font-extrabold uppercase">Uttara Outlet</p>
                      <p>Sector-3, Sonargaon Janapath Road, Uttara, Dhaka</p>
                      <p className="text-[10px] text-gray-400 font-bold">Hours: 10:00 AM - 9:30 PM (Weekly Off: Monday)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED PRODUCT SEARCH PAGE */}
        {activePage === 'product-search' && (
          <div className="max-w-6xl mx-auto px-4 py-12 space-y-10 text-left animate-in fade-in duration-300">
            <div className="text-center space-y-2 max-w-lg mx-auto">
              <span className="text-xs font-bold text-[#ff5c00] uppercase tracking-widest block">Catalog Explorer</span>
              <h1 className="font-display text-3xl font-extrabold text-gray-900 uppercase">Product Search</h1>
              
              <div className="relative mt-4">
                <input
                  type="text"
                  placeholder="What are you looking for? (e.g. Panjabi, Polo, Couple Set)"
                  value={searchPageQuery}
                  onChange={(e) => setSearchPageQuery(e.target.value)}
                  className="w-full bg-white border-2 border-[#ff5c00] rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c00]/20"
                />
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Trending Tags */}
            <div className="flex flex-wrap items-center gap-2 justify-center max-w-xl mx-auto text-xs font-bold text-gray-500">
              <span>Trending Search:</span>
              {['Panjabi', 'Couple Collection', 'Saree', 'Overshirt', 'Cotton', 'Polo', 'Jeans'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchPageQuery(tag)}
                  className="bg-gray-100 hover:bg-[#ff5c00] hover:text-white text-gray-800 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Search Results Area */}
            <div className="space-y-6 pt-4 border-t border-gray-100">
              {searchPageQuery ? (
                <>
                  <h3 className="font-display text-base font-black text-gray-900 uppercase">
                    Search Results ({PRODUCTS.filter(p => p.name.toLowerCase().includes(searchPageQuery.toLowerCase()) || p.category.toLowerCase().includes(searchPageQuery.toLowerCase())).length})
                  </h3>
                  
                  {PRODUCTS.filter(p => p.name.toLowerCase().includes(searchPageQuery.toLowerCase()) || p.category.toLowerCase().includes(searchPageQuery.toLowerCase())).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                      {PRODUCTS.filter(p => p.name.toLowerCase().includes(searchPageQuery.toLowerCase()) || p.category.toLowerCase().includes(searchPageQuery.toLowerCase())).map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onQuickView={(p) => setQuickViewProduct(p)}
                          onAddToCart={handleAddToCart}
                          onBuyNow={handleBuyNow}
                          onToggleWishlist={handleToggleWishlist}
                          isWishlisted={wishlist.some((w) => w.id === product.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center space-y-4 shadow-2xs max-w-md mx-auto">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                      <h3 className="font-sans font-bold text-base text-gray-900 uppercase">No Matches Found</h3>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                        We could not find any products matching "{searchPageQuery}". Try another keyword or explore categories below.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  <h3 className="font-display text-base font-black text-gray-900 uppercase">
                    Featured Recommendations
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {PRODUCTS.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlist.some((w) => w.id === product.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OFFERS PAGE */}
        {activePage === 'offers' && (
          <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 text-left animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#ff5c00] uppercase tracking-widest block">Save More Today</span>
              <h1 className="font-display text-3xl font-extrabold text-gray-900 uppercase">Deals & Coupons</h1>
              <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">
                Copy discount promo codes below and apply them during the checkout process for extra savings!
              </p>
            </div>

            {/* Promo Codes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { code: 'EID20', title: 'Flat ৳200 Discount', desc: 'Valid on ordering above ৳1,500. Perfect for Eid outfits and Panjabi sets.', badge: 'FESTIVAL COUPON' },
                { code: 'FREEBD', title: 'Free Home Delivery', desc: 'Get zero shipping costs nationwide on purchasing above ৳2,500.', badge: 'FREE SHIPPING' },
                { code: 'MART15', title: 'Flat 15% OFF', desc: 'Valid on entire Coordinated Couple Collection matches.', badge: 'COUPLE DEAL' }
              ].map(coupon => (
                <div key={coupon.code} className="bg-gradient-to-br from-orange-50 via-white to-amber-50/30 p-6 rounded-2xl border border-orange-100 flex flex-col justify-between shadow-2xs space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase text-[#ff5c00] tracking-wider bg-orange-100 px-2 py-0.5 rounded-sm inline-block">
                      {coupon.badge}
                    </span>
                    <h4 className="font-display text-lg font-black text-gray-900 uppercase">{coupon.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">{coupon.desc}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1 bg-white border border-dashed border-orange-300 rounded-lg px-4 py-2 text-center font-mono font-black text-sm text-gray-800 uppercase tracking-widest">
                      {coupon.code}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(coupon.code);
                        setCopiedCoupon(coupon.code);
                        setTimeout(() => setCopiedCoupon(null), 2000);
                      }}
                      className="bg-[#ff5c00] hover:bg-black text-white text-xs font-black px-4 py-2.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {copiedCoupon === coupon.code ? 'COPIED!' : 'COPY'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Flash Deals */}
            <div className="space-y-6 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-black text-gray-900 uppercase tracking-wide">
                  Active Flash Sale items
                </h3>
                <span className="text-xs font-bold text-[#ff5c00] uppercase tracking-widest">
                  Up to 40% OFF
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {PRODUCTS.filter(p => p.discountPrice && p.discountPrice < p.price).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.some((w) => w.id === product.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NEW ARRIVAL PAGE */}
        {activePage === 'new-arrival' && (
          <div className="max-w-6xl mx-auto px-4 py-12 space-y-10 text-left animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#ff5c00] uppercase tracking-widest block">Freshly Added</span>
              <h1 className="font-display text-3xl font-extrabold text-gray-900 uppercase">New Arrivals</h1>
              <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">
                Our latest premium fabric outfits, traditional ethnic Jacquard drops, and coordinated modern western wears.
              </p>
            </div>

            {/* New Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {PRODUCTS.filter(p => p.isNew).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={wishlist.some((w) => w.id === product.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIES EXPLORER PAGE */}
        {activePage === 'categories' && (
          <div className="max-w-6xl mx-auto px-4 py-12 space-y-10 text-left animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#ff5c00] uppercase tracking-widest block">Collection Map</span>
              <h1 className="font-display text-3xl font-extrabold text-gray-900 uppercase">Product Categories</h1>
              <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">
                Navigate our specialized collections of ethnic, casual, western, and smart accessory wears easily.
              </p>
            </div>

            {/* Premium bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Men Fashions', desc: 'Premium Royal Panjabis, thick cotton overshirts, tailored trousers, and formal wear.', icon: '👕', bg: 'from-orange-50 to-amber-50/20' },
                { name: 'Women Fashions', desc: 'High-density silk sarees, customized cotton salwar kameez sets, and elegant drops.', icon: '👗', bg: 'from-rose-50 to-pink-50/10' },
                { name: 'Couple Collection', desc: 'Perfectly coordinated matching couple outfits for special occasions and wedding festivals.', icon: '👩‍❤️‍👨', bg: 'from-purple-50 to-indigo-50/10' },
                { name: 'Kids Fashions', desc: 'Extremely soft combed organic cotton comfort drops for children and growing toddlers.', icon: '👶', bg: 'from-blue-50 to-sky-50/10' },
                { name: 'Accessories', desc: 'Classic chronometer watches, dial analogs, and smart leather everyday utility gear.', icon: '⌚', bg: 'from-gray-100 to-zinc-50' }
              ].map(cat => (
                <div 
                  key={cat.name} 
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setActivePage('shop');
                    window.history.pushState(null, '', `/shop?category=${encodeURIComponent(cat.name)}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`bg-gradient-to-br ${cat.bg} p-8 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs hover:border-orange-200 transition-all cursor-pointer flex flex-col justify-between min-h-[180px] group`}
                >
                  <div className="space-y-2">
                    <span className="text-3xl select-none">{cat.icon}</span>
                    <h3 className="font-display text-lg font-black text-gray-900 uppercase group-hover:text-[#ff5c00] transition-colors">{cat.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">{cat.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff5c00] uppercase tracking-wider pt-4">
                    <span>Explore Products</span>
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ PAGE */}
        {activePage === 'faq' && (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block">
                Shop Mart Support Hub
              </span>
              <h1 className="font-display text-3xl font-extrabold text-brand-text uppercase">
                Frequently Asked Questions
              </h1>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Find answer regarding sizing fits, shipping speed, and exchange procedures.
              </p>
            </div>

            {/* Accordion FAQ items */}
            <div className="space-y-4">
              {FAQ.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2"
                >
                  <h4 className="font-display font-bold text-sm md:text-base text-brand-primary">
                    Q: {faq.q}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-sans">
                    A: {faq.a}
                  </p>
                </div>
              ))}
            </div>

            {/* Support boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 text-center">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                <Phone className="w-6 h-6 text-brand-accent mx-auto" />
                <h4 className="font-bold text-sm text-brand-text">Corporate Phone Helpline</h4>
                <p className="text-xs text-gray-400">Available Daily from 9:00 AM to 10:00 PM</p>
                <strong className="text-brand-primary text-base block font-mono">+8801700000000</strong>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                <MessageCircle className="w-6 h-6 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-brand-text">WhatsApp Quick Assistance</h4>
                <p className="text-xs text-gray-400">Direct query regarding color variants or sizing</p>
                <button
                  onClick={() => window.open('https://wa.me/8801700000000', '_blank')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
                >
                  Message WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER ACCOUNT & ORDER HISTORY HUB (WITH INTEGRATED FUTURE-READY ADMIN PRE-REQUISITES) */}
        {activePage === 'account' && (
          <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 py-12">
            {!currentUser ? (
              /* --- LOGIN & REGISTRATION SYSTEM --- */
              <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-2xl shadow-xl p-8 space-y-6">
                {/* Branded Logo Header */}
                <div className="flex justify-center pb-2">
                  <div className="border-2 border-[#ff5c00] bg-[#ff5c00]/5 rounded-xl p-2 px-4 max-h-[55px] shadow-xs flex items-center justify-center">
                    <img 
                      src="/assets/Rupan Logo Final.png" 
                      alt="Rupan Logo" 
                      width={200}
                      height={200}
                      className="h-8 w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {!isRegistering ? (
                  /* Login Mode */
                  <>
                    <div className="text-center space-y-2">
                      <h1 className="font-display text-4xl font-black text-gray-900 tracking-tight">Login</h1>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Sign in to your account to continue shopping, track orders, and manage your profile.
                      </p>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (loginUsername.trim() === 'test' && loginPassword === 'test') {
                          setCurrentUser({
                            username: 'test',
                            displayName: 'test',
                            email: 'phone-534534563453-nz9rfv2h@borbila.invalid',
                            phone: '534534563453',
                            billingAddress: 'test',
                            shippingAddress: 'test',
                            city: 'Dhaka',
                            zip: '1000'
                          });
                          setSubTab('Dashboard');
                        } else {
                          // Allow logging in with any details as well for superb interactivity!
                          setCurrentUser({
                            username: loginUsername.trim(),
                            displayName: loginUsername.trim(),
                            email: `${loginUsername.trim()}@gmail.com`,
                            phone: '01711223344',
                            billingAddress: 'Dhaka, Bangladesh',
                            shippingAddress: 'Dhaka, Bangladesh',
                            city: 'Dhaka',
                            zip: '1212'
                          });
                          setSubTab('Dashboard');
                        }
                      }} 
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Number or Email *</label>
                        <input
                          type="text"
                          required
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          placeholder="test"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00] font-sans"
                        />
                      </div>

                      <div className="space-y-1.5 relative">
                        <label className="text-xs uppercase font-extrabold text-gray-500 tracking-wider block">Password *</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-[#ff5c00] font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff5c00]"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded border-gray-300 text-[#ff5c00] focus:ring-[#ff5c00]"
                          />
                          Remember me
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#ff5c00] hover:bg-[#cc4a00] text-white font-extrabold text-xs py-3.5 rounded-lg tracking-wider uppercase transition-all shadow-md cursor-pointer"
                      >
                        LOG IN
                      </button>

                      <div className="text-center">
                        <button 
                          type="button"
                          onClick={() => alert('Password reset link has been simulated sent to your email')}
                          className="text-xs font-semibold text-[#ff5c00] hover:underline cursor-pointer"
                        >
                          Lost your password?
                        </button>
                      </div>
                    </form>

                    <div className="border-t border-gray-100 pt-5 text-center space-y-3">
                      <p className="text-xs font-bold text-gray-400">NEW MEMBER?</p>
                      <button
                        onClick={() => setIsRegistering(true)}
                        className="w-full border border-[#ff5c00] text-[#ff5c00] hover:bg-orange-50 font-extrabold text-xs py-3 rounded-lg tracking-wider uppercase transition-all cursor-pointer"
                      >
                        Create New Account
                      </button>
                    </div>
                  </>
                ) : (
                  /* Register Mode */
                  <>
                    <div className="text-center space-y-2">
                      <h1 className="font-display text-3xl font-black text-gray-900 tracking-tight">Register</h1>
                      <p className="text-xs text-gray-500">
                        Create a premium Shop Mart account to get points, track shipments, and receive VIP discounts.
                      </p>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (regPassword !== regConfirmPassword) {
                          alert('Passwords do not match!');
                          return;
                        }
                        setCurrentUser({
                          username: regUsername || 'test',
                          displayName: regUsername || 'test',
                          email: regEmail || 'test@gmail.com',
                          phone: '01700000000',
                          billingAddress: 'test',
                          shippingAddress: 'test',
                          city: 'Dhaka',
                          zip: '1000'
                        });
                        setSubTab('Dashboard');
                        setIsRegistering(false);
                      }} 
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Username *</label>
                        <input
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder="e.g. test"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Email address *</label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="customer@gmail.com"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Password *</label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Confirm Password *</label>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#ff5c00] hover:bg-[#cc4a00] text-white font-extrabold text-xs py-3.5 rounded-lg tracking-wider uppercase transition-all shadow-md cursor-pointer"
                      >
                        REGISTER
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setIsRegistering(false)}
                          className="text-xs font-semibold text-[#ff5c00] hover:underline cursor-pointer"
                        >
                          Already have an account? Back to Login
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            ) : (
              /* --- AUTHENTICATED MEMBER DASHBOARD TABS SYSTEM --- */
              <div className="space-y-8">
                
                {/* 5-Column Navigation Tabs Block */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 max-w-5xl mx-auto">
                  {['Dashboard', 'Orders', 'Addresses', 'Account Details', 'Logout'].map((tab) => {
                    const isActive = subTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => {
                          if (tab === 'Logout') {
                            setCurrentUser(null);
                            setSubTab('Dashboard');
                          } else {
                            setSubTab(tab);
                          }
                        }}
                        className={`font-sans font-extrabold text-[11px] md:text-xs py-3 px-4 border text-center uppercase tracking-wider transition-all rounded-sm cursor-pointer ${
                          isActive
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-800 hover:text-[#ff5c00] border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-tab Content Area */}
                <div className="max-w-5xl mx-auto bg-white border border-gray-100 rounded-xl p-6 md:p-8 shadow-xs">
                  
                  {/* TAB 1: DASHBOARD */}
                  {subTab === 'Dashboard' && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-orange-50/40 via-white to-orange-50/20 border border-orange-100/75 rounded-2xl p-6 md:p-8 max-w-2xl text-left">
                        <span className="text-xs font-extrabold uppercase text-[#ff5c00] tracking-widest block">HELLO</span>
                        <h2 className="text-4xl font-black text-gray-900 mt-1 mb-6">
                          {currentUser.displayName || currentUser.username}
                        </h2>
                        
                        <div className="flex flex-wrap gap-4 pt-2">
                          <div className="bg-white border border-orange-100 p-5 rounded-xl min-w-[170px] text-left shadow-2xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#ff5c00]">Completed Orders</span>
                            <div className="text-3xl font-black text-gray-900 mt-2">0</div>
                          </div>
                          <div className="bg-white border border-orange-100 p-5 rounded-xl min-w-[170px] text-left shadow-2xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#ff5c00]">Cancelled Orders</span>
                            <div className="text-3xl font-black text-gray-900 mt-2">0</div>
                          </div>
                        </div>
                      </div>

                      {/* Quick navigators / action buttons */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-50 justify-start">
                        <button
                          onClick={() => setSubTab('Orders')}
                          className="bg-[#cc4a00] hover:bg-black text-white text-[11px] font-extrabold py-2.5 px-5 rounded-md transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                        >
                          Recent Orders
                        </button>
                        <button
                          onClick={() => setSubTab('Addresses')}
                          className="bg-[#cc4a00] hover:bg-black text-white text-[11px] font-extrabold py-2.5 px-5 rounded-md transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                        >
                          Addresses
                        </button>
                        <button
                          onClick={() => setSubTab('Account Details')}
                          className="bg-[#cc4a00] hover:bg-black text-white text-[11px] font-extrabold py-2.5 px-5 rounded-md transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                        >
                          Account Details
                        </button>
                        <button
                          onClick={() => {
                            setCurrentUser(null);
                            setSubTab('Dashboard');
                          }}
                          className="bg-gray-800 hover:bg-red-700 text-white text-[11px] font-extrabold py-2.5 px-5 rounded-md transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                        >
                          Log out
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: ORDERS LIST */}
                  {subTab === 'Orders' && (
                    <div className="space-y-6">
                      <h3 className="font-display text-lg font-black text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-3">
                        My Placed Orders
                      </h3>
                      
                      {orders.filter(o => o.customerName === currentUser.username).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse font-sans">
                            <thead>
                              <tr className="border-b border-gray-200 text-xs font-black uppercase text-gray-400">
                                <th className="pb-3 pr-4">Order</th>
                                <th className="pb-3 px-4">Date</th>
                                <th className="pb-3 px-4">Status</th>
                                <th className="pb-3 px-4">Total</th>
                                <th className="pb-3 pl-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                              {orders
                                .filter(o => o.customerName === currentUser.username)
                                .map((o) => (
                                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 pr-4 text-[#ff5c00] font-extrabold">
                                      #{o.id}
                                    </td>
                                    <td className="py-4 px-4 text-gray-500 font-semibold">
                                      {o.createdAt}
                                    </td>
                                    <td className="py-4 px-4">
                                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                        o.status === 'Delivered'
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : o.status === 'Shipped' || o.status === 'Processing'
                                          ? 'bg-blue-50 text-brand-primary'
                                          : 'bg-amber-50 text-amber-700'
                                      }`}>
                                        {o.status}
                                      </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-800 font-extrabold">
                                      {o.total.toLocaleString('en-IN')}৳ for {o.items.reduce((sum, i) => sum + i.quantity, 0)} item
                                    </td>
                                    <td className="py-4 pl-4 text-right">
                                      <button
                                        onClick={() => {
                                          setLastPlacedOrder(o);
                                          setActivePage('order-success');
                                        }}
                                        className="bg-[#ff5c00] hover:bg-black text-white text-[10px] font-extrabold px-3 py-1.5 rounded-sm uppercase tracking-wider cursor-pointer"
                                      >
                                        View
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic py-4">No orders have been registered yet.</p>
                      )}
                    </div>
                  )}

                  {/* TAB 3: ADDRESSES */}
                  {subTab === 'Addresses' && (
                    <div className="space-y-6 text-left">
                      <p className="text-sm text-gray-600 leading-relaxed font-semibold">
                        The following addresses will be used on the checkout page by default.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        
                        {/* Billing Column */}
                        <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <h4 className="font-display text-base font-black text-gray-900 uppercase tracking-wide">
                              Billing address
                            </h4>
                            {!isEditingBilling && (
                              <button
                                onClick={() => setIsEditingBilling(true)}
                                className="text-xs font-black text-[#ff5c00] hover:underline uppercase tracking-wider cursor-pointer"
                              >
                                Edit
                              </button>
                            )}
                          </div>

                          {isEditingBilling ? (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                setCurrentUser({
                                  ...currentUser,
                                  billingAddress: addressBillingStreet,
                                  city: addressBillingCity,
                                  zip: addressBillingZip
                                });
                                setIsEditingBilling(false);
                                alert('Billing address updated successfully!');
                              }}
                              className="space-y-3"
                            >
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-400">Street Address *</label>
                                <input
                                  type="text"
                                  required
                                  value={addressBillingStreet}
                                  onChange={(e) => setAddressBillingStreet(e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ff5c00]"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-gray-400">City *</label>
                                  <input
                                    type="text"
                                    required
                                    value={addressBillingCity}
                                    onChange={(e) => setAddressBillingCity(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ff5c00]"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-gray-400">Postcode / ZIP *</label>
                                  <input
                                    type="text"
                                    required
                                    value={addressBillingZip}
                                    onChange={(e) => setAddressBillingZip(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ff5c00]"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 pt-2">
                                <button
                                  type="submit"
                                  className="bg-[#ff5c00] text-white text-[10px] font-bold px-3 py-2 rounded-md uppercase tracking-wider cursor-pointer hover:bg-black transition-colors"
                                >
                                  Save Address
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAddressBillingStreet(currentUser.billingAddress || '');
                                    setAddressBillingCity(currentUser.city || 'Dhaka');
                                    setAddressBillingZip(currentUser.zip || '1000');
                                    setIsEditingBilling(false);
                                  }}
                                  className="bg-gray-200 text-gray-700 text-[10px] font-bold px-3 py-2 rounded-md uppercase tracking-wider cursor-pointer hover:bg-gray-300 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="text-sm text-gray-600 space-y-1 font-semibold leading-relaxed text-left">
                              <p className="text-gray-900 font-extrabold">{currentUser.displayName || currentUser.username}</p>
                              <p>{currentUser.billingAddress || 'Not set yet'}</p>
                              <p>{currentUser.city || 'Dhaka'}</p>
                              <p>{currentUser.zip || '1000'}</p>
                              <p className="text-xs text-[#ff5c00] pt-2">Bangladesh</p>
                            </div>
                          )}
                        </div>

                        {/* Shipping Column */}
                        <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <h4 className="font-display text-base font-black text-gray-900 uppercase tracking-wide">
                              Shipping address
                            </h4>
                            {!isEditingShipping && (
                              <button
                                onClick={() => setIsEditingShipping(true)}
                                className="text-xs font-black text-[#ff5c00] hover:underline uppercase tracking-wider cursor-pointer"
                              >
                                Edit
                              </button>
                            )}
                          </div>

                          {isEditingShipping ? (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                setCurrentUser({
                                  ...currentUser,
                                  shippingAddress: addressShippingStreet,
                                  city: addressShippingCity,
                                  zip: addressShippingZip
                                });
                                setIsEditingShipping(false);
                                alert('Shipping address updated successfully!');
                              }}
                              className="space-y-3"
                            >
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-400">Street Address *</label>
                                <input
                                  type="text"
                                  required
                                  value={addressShippingStreet}
                                  onChange={(e) => setAddressShippingStreet(e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ff5c00]"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-gray-400">City *</label>
                                  <input
                                    type="text"
                                    required
                                    value={addressShippingCity}
                                    onChange={(e) => setAddressShippingCity(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ff5c00]"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-gray-400">Postcode / ZIP *</label>
                                  <input
                                    type="text"
                                    required
                                    value={addressShippingZip}
                                    onChange={(e) => setAddressShippingZip(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ff5c00]"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 pt-2">
                                <button
                                  type="submit"
                                  className="bg-[#ff5c00] text-white text-[10px] font-bold px-3 py-2 rounded-md uppercase tracking-wider cursor-pointer hover:bg-black transition-colors"
                                >
                                  Save Address
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAddressShippingStreet(currentUser.shippingAddress || '');
                                    setAddressShippingCity(currentUser.city || 'Dhaka');
                                    setAddressShippingZip(currentUser.zip || '1000');
                                    setIsEditingShipping(false);
                                  }}
                                  className="bg-gray-200 text-gray-700 text-[10px] font-bold px-3 py-2 rounded-md uppercase tracking-wider cursor-pointer hover:bg-gray-300 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="text-sm text-gray-600 space-y-1 font-semibold leading-relaxed text-left">
                              <p className="text-gray-900 font-extrabold">{currentUser.displayName || currentUser.username}</p>
                              <p>{currentUser.shippingAddress || 'Not set yet'}</p>
                              <p>{currentUser.city || 'Dhaka'}</p>
                              <p>{currentUser.zip || '1000'}</p>
                              <p className="text-xs text-[#ff5c00] pt-2">Bangladesh</p>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* TAB 4: ACCOUNT DETAILS FORM */}
                  {subTab === 'Account Details' && (
                    <div className="space-y-6">
                      <h3 className="font-display text-lg font-black text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-3">
                        Account Details
                      </h3>

                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          setCurrentUser({
                            ...currentUser,
                            displayName: profileDisplayName,
                            email: profileEmail
                          });
                          alert('Profile changes updated successfully!');
                        }}
                        className="space-y-5 max-w-xl text-left"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase font-extrabold text-gray-500">First name *</label>
                            <input
                              type="text"
                              required
                              value={profileFirstName}
                              onChange={(e) => setProfileFirstName(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase font-extrabold text-gray-500">Last name *</label>
                            <input
                              type="text"
                              value={profileLastName}
                              onChange={(e) => setProfileLastName(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs uppercase font-extrabold text-gray-500">Display name *</label>
                          <input
                            type="text"
                            required
                            value={profileDisplayName}
                            onChange={(e) => setProfileDisplayName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                          />
                          <span className="block text-[10px] text-[#ff5c00] font-bold leading-normal">
                            This will be how your name will be displayed in the account section and in reviews
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs uppercase font-extrabold text-gray-500">Email address *</label>
                          <input
                            type="email"
                            required
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                          />
                        </div>

                        {/* Password Change Subfield */}
                        <div className="border-t border-gray-100 pt-5 mt-5 space-y-4">
                          <h4 className="font-sans font-extrabold text-sm text-gray-800 uppercase tracking-wide">
                            Password change
                          </h4>
                          
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-[11px] uppercase font-extrabold text-gray-400">Current password (leave blank to leave unchanged)</label>
                              <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] uppercase font-extrabold text-gray-400">New password (leave blank to leave unchanged)</label>
                              <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] uppercase font-extrabold text-gray-400">Confirm new password</label>
                              <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="bg-[#ff5c00] hover:bg-[#cc4a00] text-white font-extrabold text-xs py-3 px-6 rounded-md tracking-wider uppercase transition-all shadow-sm cursor-pointer"
                        >
                          SAVE CHANGES
                        </button>
                      </form>
                    </div>
                  )}

                </div>

              </div>
            )}
          </div>
        )}

        {/* COMPREHENSIVE SIMULATED ADMIN DASHBOARD FOR ADVANCED SYSTEM READY EVALUATIONS */}
        {activePage === 'admin-dashboard' && (
          <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 py-12 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6 gap-4">
              <div>
                <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block">
                  Shop Mart Limited
                </span>
                <h1 className="font-display text-3xl font-extrabold text-brand-text uppercase">
                  Executive Admin Control Room
                </h1>
              </div>
              <button
                onClick={() => setActivePage('account')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition-colors"
              >
                Back to My Profile
              </button>
            </div>

            {/* Stat Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
                <div className="p-3.5 bg-blue-50 rounded-xl text-brand-primary">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-bold uppercase">Simulated Gross Revenue</span>
                  <strong className="text-xl font-bold text-brand-text">৳{(orders.reduce((sum, o) => sum + o.total, 0)).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
                <div className="p-3.5 bg-amber-50 rounded-xl text-brand-accent">
                  <ListOrdered className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-bold uppercase">Total Orders Registered</span>
                  <strong className="text-xl font-bold text-brand-text">{orders.length} Deliveries</strong>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
                <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-bold uppercase">Active Customer Reach</span>
                  <strong className="text-xl font-bold text-brand-text">2,482 Shoppers</strong>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
                <div className="p-3.5 bg-red-50 rounded-xl text-red-500">
                  <ShoppingBasket className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-bold uppercase">In-Stock Catalog Items</span>
                  <strong className="text-xl font-bold text-brand-text">{PRODUCTS.reduce((sum, p) => sum + p.stock, 0)} Items</strong>
                </div>
              </div>
            </div>

            {/* Table displaying simulated active database orders */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brand-text">
                  Live Dispatch Orders Queue (Dynamic State)
                </h3>
                <button
                  onClick={() => {
                    const freshOrders = orders.map(o => o.status === 'Confirmed' ? { ...o, status: 'Packed' as const } : o);
                    setOrders(freshOrders);
                    localStorage.setItem('rup_orders', JSON.stringify(freshOrders));
                    alert('Order Dispatch Statuses Updated Successfully!');
                  }}
                  className="bg-brand-primary text-white text-[10px] font-bold py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1 hover:bg-blue-900 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Auto-Advance New Deliveries Status
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Delivery Address</th>
                      <th className="p-4 text-right">Total (Payable)</th>
                      <th className="p-4">Live Dispatch Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-mono font-bold text-brand-primary">{o.id}</td>
                        <td className="p-4">
                          <p className="font-bold text-brand-text">{o.customerName}</p>
                          <p className="text-gray-400 text-xs font-mono">{o.phone}</p>
                        </td>
                        <td className="p-4 max-w-xs truncate" title={o.address}>
                          {o.address} ({o.area})
                        </td>
                        <td className="p-4 text-right font-bold text-brand-text">
                          ৳{o.total.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            o.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'Shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BRIGHT STATIC POLICIES TABS PAGE */}
        {activePage === 'policy' && (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
            <h1 className="font-display text-3xl font-extrabold text-brand-text uppercase text-center">
              Brand Policies & Terms
            </h1>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="p-6 md:p-8 space-y-8 font-sans text-sm text-gray-600 leading-relaxed">
                
                {/* Exchange Policy */}
                <div className="space-y-3">
                  <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-brand-accent" />
                    7-Day Easy Exchange Policy
                  </h3>
                  <p>
                    We want you to love your style. If a garment does not fit as expected or displays any manufacturer defect, Shop Mart offers a straightforward doorstep exchange program.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Garments must remain unwashed, unworn, with all designer hangtags intact.</li>
                    <li>Saree blouses or custom tailored pieces are ineligible unless defect is present initially.</li>
                    <li>Doorstep pickup exchanges within Dhaka are completed within 48 hours of ticket creation.</li>
                  </ul>
                </div>

                {/* Privacy Policy */}
                <div className="space-y-3 border-t border-gray-100 pt-6">
                  <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-accent" />
                    Secure Customer Privacy Commitment
                  </h3>
                  <p>
                    Your shopping security and transaction safety is our topmost priority. Shop Mart Limited never sells, shares, or leases customer phone numbers, home delivery coordinates, or email IDs with third-party networks. Financial data processed via bKash, Nagad, and secure credit cards are fully tokenized.
                  </p>
                </div>

                {/* Terms of Use */}
                <div className="space-y-3 border-t border-gray-100 pt-6">
                  <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-accent" />
                    Terms of Online Transactions
                  </h3>
                  <p>
                    By placing an order across our development or shared catalog servers, you acknowledge nationwide Cash on Delivery is an act of authentic purchase. Customers are requested to inspect packages in front of courier delivery agents before signing acceptance receipts.
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* PRODUCT DETAILS PAGE */}
        {activePage === 'product-detail' && currentProductId && (
          <ProductDetail
            productId={currentProductId}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            onOpenSizeGuide={handleOpenSizeGuide}
            products={PRODUCTS}
            reviews={REVIEWS}
          />
        )}

        {/* FASHION JOURNAL & BLOG PAGES */}
        {(activePage === 'blog' || activePage === 'blog-detail') && (
          <BlogPage 
            blogId={activePage === 'blog-detail' ? currentBlogId : null} 
            blogs={BLOGS}
          />
        )}

      </main>

      {/* FOOTER MULTI-COLUMN COMPONENT */}
      <Footer onPageChange={navigateTo} />

      {/* Floating Helpers */}
      <WhatsAppButton />

      {/* Exquisite Quick View modal slider popup */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? wishlist.some((w) => w.id === quickViewProduct.id) : false}
        onOpenSizeGuide={handleOpenSizeGuide}
      />

      {/* Size Guide Info popup */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={sizeGuideCategory}
      />

    </div>
  );
}
