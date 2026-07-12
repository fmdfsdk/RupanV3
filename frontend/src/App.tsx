/**
 * Rupan Storefront - Stable Production Build
 */
import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useStore } from './store/useStore';
import { checkSupabaseConnection } from './lib/supabase';
import { trackPageView, generateEventId, initializeTelemetry, trackViewContent } from './lib/telemetry';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import QuickViewModal from './components/QuickViewModal';
import SizeGuideModal from './components/SizeGuideModal';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import MobileBottomMenu from './components/MobileBottomMenu';

// Lazy load pages for elite code-splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const OffersPage = lazy(() => import('./pages/OffersPage'));
const NewArrivalsPage = lazy(() => import('./pages/NewArrivalsPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const BlogPage = lazy(() => import('./components/BlogPage'));

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dbSettings = useStore((state) => state.dbSettings);

  // Initialize Telemetry immediately on mount from cache if possible
  useEffect(() => {
    const cachedSettings = localStorage.getItem('rup_db_settings');
    if (cachedSettings) {
      try {
        const sData = JSON.parse(cachedSettings);
        initializeTelemetry({
          metaPixelId:         sData.meta_pixel_id || sData.metaPixelId,
          metaTestEventCode:   sData.meta_test_event_code || sData.metaTestEventCode,
          metaCapiAccessToken: sData.meta_capi_access_token || sData.metaCapiAccessToken,
          googleTagManagerId:  sData.google_tag_manager_id || sData.googleTagManagerId,
          googleAnalyticsId:   sData.google_analytics_id || sData.googleAnalyticsId,
        });
      } catch (e) {
        console.error('Error parsing cached settings for telemetry:', e);
      }
    }
  }, []);

  // Track page views on route changes
  useEffect(() => {
    // Read from state or fallback to local storage cache immediately
    let testCode = dbSettings?.metaTestEventCode || dbSettings?.meta_test_event_code;
    let hasPixel = !!dbSettings?.metaPixelId || !!dbSettings?.meta_pixel_id;

    if (!testCode || !hasPixel) {
      try {
        const cachedRaw = localStorage.getItem('rup_db_settings');
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (!testCode) testCode = cached.meta_test_event_code || cached.metaTestEventCode;
          if (!hasPixel) hasPixel = !!cached.meta_pixel_id || !!cached.metaPixelId;
        }
      } catch (_) {}
    }

    if (hasPixel) {
      const eventId = generateEventId('pageview');
      trackPageView(
        location.pathname + location.search,
        eventId,
        testCode
      );
    }
  }, [location, dbSettings]);

  const isSupabaseOnline = useStore((state) => state.isSupabaseOnline);
  const setIsSupabaseOnline = useStore((state) => state.setIsSupabaseOnline);
  const loadInitialData = useStore((state) => state.loadInitialData);
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const currentUser = useStore((state) => state.currentUser);
  
  // Modal states
  const quickViewProduct = useStore((state) => state.quickViewProduct);
  const setQuickViewProduct = useStore((state) => state.setQuickViewProduct);
  const sizeGuideOpen = useStore((state) => state.sizeGuideOpen);
  const setSizeGuideOpen = useStore((state) => state.setSizeGuideOpen);
  const sizeGuideCategory = useStore((state) => state.sizeGuideCategory);
  
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);

  // Track ViewContent on Quick View modal open
  const hasTrackedQuickView = React.useRef<string | null>(null);
  useEffect(() => {
    if (quickViewProduct) {
      if (hasTrackedQuickView.current !== quickViewProduct.id) {
        hasTrackedQuickView.current = quickViewProduct.id;
        const eventId = generateEventId('ViewContent');
        const testCode = dbSettings?.metaTestEventCode || dbSettings?.meta_test_event_code;
        trackViewContent(quickViewProduct, eventId, testCode);
      }
    } else {
      hasTrackedQuickView.current = null;
    }
  }, [quickViewProduct, dbSettings]);

  // Check Supabase connection on load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isOnline = await checkSupabaseConnection();
        setIsSupabaseOnline(isOnline);
      } catch (err) {
        setIsSupabaseOnline(false);
      }
    };
    checkConnection();
  }, [setIsSupabaseOnline]);

  // Load initial catalog data when Supabase online status is determined
  useEffect(() => {
    loadInitialData();
  }, [isSupabaseOnline, loadInitialData]);

  // Map clicks on Header/Footer navigation properties to react-router page paths
  const handlePageChange = (pageId: string) => {
    if (pageId === 'home' || pageId === '/') {
      navigate('/');
    } else if (pageId === 'admin') {
      navigate('/account');
    } else if (pageId === 'faq' || pageId === 'faqs') {
      navigate('/faq');
    } else if (pageId === 'blog' || pageId === 'blogs') {
      navigate('/blog');
    } else if (pageId === 'account' || pageId === 'my-account') {
      navigate('/account');
    } else if (pageId === 'offer' || pageId === 'offers') {
      navigate('/offers');
    } else if (pageId === 'new-arrival' || pageId === 'new-arrivals') {
      navigate('/new-arrivals');
    } else if (pageId.startsWith('/')) {
      navigate(pageId);
    } else {
      navigate(`/${pageId}`);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const handleBuyNow = (product: any, size: string, color: string) => {
    addToCart(product, size, color, 1);
    navigate('/checkout');
  };

  const BLOGS = useStore((state) => state.dbBlogs) || [];
  
  const cleanIdPattern = (path: string) => {
    return path
      .toLowerCase()
      .replace(/^\//, '')
      .replace(/^(blog|offer|product|landing|blogs|offers|products)\//, '')
      .replace(/^blog-/, '')
      .replace(/(^-|-$)/g, '');
  };

  const isBlankLayoutBlog = (() => {
    const activeBlog = BLOGS.find((b) => {
      return cleanIdPattern(b.id) === cleanIdPattern(location.pathname) || b.id === location.pathname;
    });

    if (!activeBlog) return false;

    const metaMatch = (activeBlog.content || '').match(/^<!-- metadata:\s*({.*?})\s*-->/s);
    if (metaMatch) {
      try {
        const meta = JSON.parse(metaMatch[1]);
        return meta.layout === 'blank';
      } catch (e) {}
    }
    return !!(activeBlog.content?.startsWith('<!-- layout: blank -->') || activeBlog.content?.startsWith('<!-- layout:blank -->'));
  })();

  return (
    <div className={`flex flex-col min-h-screen bg-white ${isBlankLayoutBlog ? 'p-0 m-0 overflow-x-hidden' : ''}`}>
      {/* HEADER BAR */}
      {!isBlankLayoutBlog && (
        <Header
          activePage="home" // controlled by React Router paths now
          onPageChange={handlePageChange}
          cartCount={cartCount}
          cartTotal={cartTotal}
          wishlistCount={wishlist.length}
          onOpenSearch={() => navigate('/product-search')}
          currentUser={currentUser}
        />
      )}

      <main className={`flex-1 ${isBlankLayoutBlog ? 'pb-0' : 'pb-16 md:pb-0'}`}>
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="max-w-4xl mx-auto px-4 py-32 text-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#ff5c00] mx-auto"></div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                  Loading Page Contents...
                </p>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product" element={<ProductRedirect />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/track-order" element={<OrderTrackingPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/about-us" element={<AboutPage />} />
              <Route path="/contact-us" element={<ContactPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/offer" element={<OffersPage />} />
              <Route path="/new-arrival" element={<NewArrivalsPage />} />
              <Route path="/new-arrivals" element={<NewArrivalsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/faqs" element={<FAQPage />} />
              <Route path="/policy" element={<PolicyPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/my-account" element={<AccountPage />} />
              <Route path="/register" element={<AccountPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPage />} />
              <Route path="/blogs" element={<BlogPage />} />
              <Route path="/product-search" element={<SearchPage />} />
              <Route path="/*" element={<CatchAllRoute />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* FOOTER */}
      {!isBlankLayoutBlog && <Footer onPageChange={handlePageChange} />}

      {/* Mobile Sticky Bottom Menu Bar */}
      {!isBlankLayoutBlog && <MobileBottomMenu />}

      {/* Floating Helpers */}
      {!isBlankLayoutBlog && <WhatsAppButton />}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={toggleWishlist}
        isWishlisted={quickViewProduct ? wishlist.some((w) => w.id === quickViewProduct.id) : false}
        onOpenSizeGuide={(cat) => {
          setQuickViewProduct(null);
          useStore.getState().setSizeGuideCategory(cat);
          useStore.getState().setSizeGuideOpen(true);
        }}
      />

      {/* Size Guide Info popup */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={sizeGuideCategory}
      />

      {/* TOAST NOTIFICATION FLOATING PORTAL */}
      <ToastContainer />
    </div>
  );
}

function CatchAllRoute() {
  const BLOGS = useStore((state) => state.dbBlogs) || [];
  const isDataLoaded = useStore((state) => state.isDataLoaded);
  const location = useLocation();

  // Strip common URL prefixes so /offer/foo, /blog/foo, /landing/foo all resolve to same slug
  const cleanSlug = (path: string) => {
    return path
      .toLowerCase()
      .replace(/^\//, '')
      .replace(/^(blog|offer|product|landing|blogs|offers|products)\//, '')
      .replace(/^blog-/, '')
      .replace(/(^-|-$)/g, '');
  };

  // 1. Try exact match first
  const matchingBlog = BLOGS.find((b) => b.id === location.pathname)
    // 2. Try prefix-immune slug match as fallback
    ?? BLOGS.find((b) => cleanSlug(b.id) === cleanSlug(location.pathname));

  if (matchingBlog) {
    return <BlogPage />;
  }

  // Still loading data — show spinner instead of premature 404
  if (!isDataLoaded) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading page...</p>
      </div>
    );
  }

  // Data is loaded but no match found — genuine 404
  return (
    <div className="max-w-md mx-auto py-32 text-center space-y-6 animate-in fade-in duration-300">
      <h1 className="text-6xl font-black text-zinc-900 tracking-tight">404</h1>
      <p className="text-sm font-semibold text-gray-500 max-w-xs mx-auto">
        We couldn't find the page you are looking for. It might have been moved or deleted.
      </p>
      <Link
        to="/"
        className="inline-block bg-brand-primary text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-blue-900 transition-colors shadow-md"
      >
        Back to Home
      </Link>
    </div>
  );
}

function ProductRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fetchProductByIdFromDB = useStore((state) => state.fetchProductByIdFromDB);

  useEffect(() => {
    const productId = searchParams.get('id');
    if (!productId) {
      navigate('/shop', { replace: true });
      return;
    }

    let active = true;
    const resolveRedirect = async () => {
      try {
        const product = await fetchProductByIdFromDB(productId);
        if (active) {
          if (product) {
            navigate(`/product/${product.slug || product.id}`, { replace: true });
          } else {
            navigate('/shop', { replace: true });
          }
        }
      } catch (err) {
        console.error('Client-side redirect error:', err);
        if (active) {
          navigate('/shop', { replace: true });
        }
      }
    };

    resolveRedirect();
    return () => {
      active = false;
    };
  }, [searchParams, fetchProductByIdFromDB, navigate]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Finding product...</p>
    </div>
  );
}
