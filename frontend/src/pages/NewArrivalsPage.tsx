import React from 'react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';

export default function NewArrivalsPage() {
  const navigate = useNavigate();
  const PRODUCTS = useStore((state) => state.dbProducts);
  const wishlist = useStore((state) => state.wishlist);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const addToCart = useStore((state) => state.addToCart);
  const setQuickViewProduct = useStore((state) => state.setQuickViewProduct);

  const handleBuyNow = (product: any, size: string, color: string) => {
    addToCart(product, size, color, 1);
    navigate('/checkout');
  };

  return (
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
            onAddToCart={addToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={toggleWishlist}
            isWishlisted={wishlist.some((w) => w.id === product.id)}
          />
        ))}
      </div>
    </div>
  );
}
