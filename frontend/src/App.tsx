import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { checkSupabaseConnection } from './lib/supabase';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import QuickViewModal from './components/QuickViewModal';
import SizeGuideModal from './components/SizeGuideModal';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';

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

  // Load Zustand state & actions
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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* HEADER BAR */}
      <Header
        activePage="home" // controlled by React Router paths now
        onPageChange={handlePageChange}
        cartCount={cartCount}
        cartTotal={cartTotal}
        wishlistCount={wishlist.length}
        onOpenSearch={() => navigate('/product-search')}
        currentUser={currentUser}
      />

      <main className="flex-1 pb-16 md:pb-0">
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

            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* FOOTER */}
      <Footer onPageChange={handlePageChange} />

      {/* Floating Helpers */}
      <WhatsAppButton />

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
