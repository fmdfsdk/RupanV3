import React from 'react';
import { Heart } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';

export default function WishlistPage() {
  const navigate = useNavigate();
  const wishlist = useStore((state) => state.wishlist);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const addToCart = useStore((state) => state.addToCart);
  const setQuickViewProduct = useStore((state) => state.setQuickViewProduct);

  const handleBuyNow = (product: any, size: string, color: string) => {
    addToCart(product, size, color, 1);
    navigate('/checkout');
  };

  return (
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
              onAddToCart={addToCart}
              onBuyNow={handleBuyNow}
              onToggleWishlist={toggleWishlist}
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
              navigate('/shop');
            }}
            className="bg-brand-primary hover:bg-blue-900 text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      )}
    </div>
  );
}
