/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Star, Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, 
  MessageCircle, ArrowLeft, Plus, Minus, CheckCircle, Share2, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRODUCTS as MOCK_PRODUCTS, REVIEWS as MOCK_REVIEWS } from '../data';
import ProductCard from './ProductCard';
import { Product, Review } from '../types';
import { useStore } from '../store/useStore';
import { getOptimizedImageUrl, getProductSlug } from '../utils/image';
import ProductImage from './ProductImage';
import { formatDescriptionToHtml } from '../lib/formatter';

interface ProductDetailProps {
  productId: string;
  selectedProduct?: Product | null;
  onAddToCart: (product: Product, size: string, color: string, qty?: number) => void;
  onBuyNow: (product: Product, size: string, color: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: Product[];
  onOpenSizeGuide: (category: string) => void;
  products?: Product[];
  reviews?: Review[];
  onNavigate?: (page: string, category?: string) => void;
}


export default function ProductDetail({
  productId,
  selectedProduct,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlist,
  onOpenSizeGuide,
  products,
  reviews,
  onNavigate
}: ProductDetailProps) {
  const PRODUCTS = products || MOCK_PRODUCTS;
  const REVIEWS = reviews || MOCK_REVIEWS;
  const product = selectedProduct || PRODUCTS.find((p) => p.id === productId || p.slug === productId || getProductSlug(p.name, p.id) === productId || getProductSlug(p.name, p.id).replace(/-\d+$/, '') === productId) || PRODUCTS[0];

  const productImages = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600'];

  const productColors = Array.isArray(product.colors) ? product.colors : [];
  const productSizes = Array.isArray(product.sizes) ? product.sizes : [];

  const [activeImage, setActiveImage] = useState<string>(productImages[0]);
  const [selectedColor, setSelectedColor] = useState<string>(productColors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState<string>(productSizes[0] || 'M');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Hover zoom styles state
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.5)',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transform: 'scale(1)',
      transformOrigin: 'center center',
    });
  };

  const addRecentlyViewedId = useStore((state) => state.addRecentlyViewedId);
  const recentlyViewedIds = useStore((state) => state.recentlyViewedIds);

  // Sync state if product changes
  useEffect(() => {
    setActiveImage(productImages[0]);
    setSelectedColor(productColors[0]?.name || '');
    setSelectedSize(productSizes[0] || 'Standard');
    setQuantity(1);
    if (product.id) {
      addRecentlyViewedId(product.id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId, product, addRecentlyViewedId, productImages]);

  const isWishlisted = wishlist.some((w) => w.id === product.id);

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const currentPrice = product.discountPrice || product.price;

  // Find related products (same category, excluding current product)
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  // If no related products, show best sellers
  const displayRelated = relatedProducts.length > 0 
    ? relatedProducts 
    : PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAddToCartClick = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 3000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate mock reviews specific to this product
  const getProductReviews = (): Review[] => {
    // If there are real database reviews for this product, use them
    const realReviews = REVIEWS.filter(r => r.productId === product.id);
    if (realReviews.length > 0 && products) { // check if products prop is provided to signify db state
      return realReviews;
    }

    const genericReviews = REVIEWS;
    return genericReviews.map((rev, index) => {
      let comment = rev.comment;
      if (index === 0 && product.category === 'Panjabi') {
        comment = `The ${product.name} fits like a dream! The jacquard texture is incredibly soft and looks super royal in natural light.`;
      } else if (index === 1 && product.category === 'Saree') {
        comment = `Beautiful ${product.name}! The drape holds pristine shapes perfectly. Recommended for festive wear in Bangladesh.`;
      } else if (index === 2 && product.category === 'Couple Collection') {
        comment = `Super coordinated matching couple sets! The hand craftsmanship on the neckline is premium and elegant.`;
      } else if (product.category === 'Shirts' || product.category === 'T-Shirts' || product.category === 'Polo') {
        comment = `Incredibly breathable combed cotton. Absolutely premium stitching, perfect for warm and humid Dhaka weather.`;
      }
      return {
        ...rev,
        comment,
        productId: product.id
      };
    });
  };

  const productReviews = getProductReviews();

  return (
    <div className="w-full max-w-[1750px] mx-auto px-4 md:px-12 lg:px-16 py-10 space-y-12">
      {/* Breadcrumb Navigation — uses <Link> for crawlability, onClick kept for SPA UX */}
      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-500">
        <Link
          to="/"
          onClick={() => onNavigate && onNavigate('home')}
          className="hover:text-brand-primary transition-colors cursor-pointer"
        >
          Home
        </Link>
        <span>/</span>
        <Link
          to="/shop"
          onClick={() => onNavigate && onNavigate('shop', 'All')}
          className="hover:text-brand-primary transition-colors cursor-pointer"
        >
          Shop
        </Link>
        <span>/</span>
        <Link
          to={`/shop?category=${encodeURIComponent(product.category || '')}`}
          onClick={() => onNavigate && onNavigate('shop', product.category)}
          className="hover:text-brand-primary transition-colors uppercase cursor-pointer font-semibold text-gray-700"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-brand-text truncate max-w-xs font-semibold">{product.name}</span>
      </div>

      {/* Product Detail Main Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Image Gallery (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative aspect-square rounded-sm overflow-hidden bg-white border border-gray-200 flex items-center justify-center p-8 group cursor-zoom-in"
          >
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-[#ff5c00] text-white text-xs font-black px-3 py-1.5 rounded-sm">
                -{discountPercent}%
              </span>
            )}
            
            {/* Magnifying Glass search decoration */}
            <button className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:scale-105 transition-transform text-gray-400">
              <Search className="w-4 h-4" />
            </button>
            
            <ProductImage
              src={getOptimizedImageUrl(activeImage, 800)}
              alt={product.name}
              style={{
                transition: 'transform 0.08s ease-out, transform-origin 0.08s ease-out',
                ...zoomStyle
              }}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Thumbnails list */}
          <div className="flex flex-wrap gap-3">
            {productImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`w-18 h-18 rounded-sm overflow-hidden border bg-white transition-all cursor-pointer ${
                  activeImage === img ? 'border-brand-primary ring-1 ring-brand-primary/50' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <ProductImage
                  src={getOptimizedImageUrl(img, 150)}
                  alt={`${product.name} Thumbnail ${i + 1}`}
                  className="w-full h-full object-contain p-1"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Order specifications (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Title & Share */}
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-sans text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                  {product.name}
                </h1>
                {product.sku && (
                  <span className="text-xs font-mono text-gray-400 block mt-1">
                    Product Code: <strong className="text-gray-600 font-extrabold">{product.sku}</strong>
                  </span>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer text-gray-500"
                  title="Copy Product Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {copied && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-sm">Copied!</span>}
              </div>
            </div>

            {/* Price section - bold styling */}
            <div className="flex items-center gap-3 text-2xl font-bold font-sans pt-1">
              {product.discountPrice ? (
                <>
                  <span className="text-gray-400 line-through font-medium text-lg">
                    {product.price.toLocaleString('en-IN')}৳
                  </span>
                  <span className="text-[#ff5c00] font-black">
                    {product.discountPrice.toLocaleString('en-IN')}৳
                  </span>
                </>
              ) : (
                <span className="text-gray-900 font-black">
                  {product.price.toLocaleString('en-IN')}৳
                </span>
              )}
            </div>
          </div>

          {product.shortDescription ? (
            <div className="text-sm text-gray-500 leading-relaxed font-sans font-medium">
              {product.shortDescription}
            </div>
          ) : null}

          {/* Stock state badges */}
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            {product.stock > 10 ? (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1.5 rounded-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                In Stock ({product.stock} units)
              </span>
            ) : product.stock > 0 ? (
              <span className="bg-amber-50 text-amber-700 border border-amber-150 px-2.5 py-1.5 rounded-sm flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Low Stock (Only {product.stock} left!)
              </span>
            ) : (
              <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1.5 rounded-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                Out of Stock
              </span>
            )}
             <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1.5 rounded-sm flex items-center">
               Brand: {product.brand ? product.brand.replace(/reseller/gi, '').trim() || 'Rupan' : 'Rupan'}
             </span>
          </div>

          {/* Color Selection Swatches */}
          {productColors.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs uppercase font-extrabold text-gray-400 block tracking-wider">
                Color: <strong className="text-gray-900">{selectedColor}</strong>
              </span>
              <div className="flex items-center gap-2.5">
                {productColors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-7 h-7 rounded-full transition-all flex items-center justify-center cursor-pointer ${c.class} ${
                      selectedColor === c.name
                        ? 'ring-2 ring-brand-primary ring-offset-2 scale-105'
                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizing selection */}
          {productSizes.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
                <span className="text-gray-400">Select Size</span>
                <button
                  type="button"
                  onClick={() => onOpenSizeGuide(product.category)}
                  className="text-brand-primary hover:underline cursor-pointer"
                >
                  Sizing Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {productSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-10 h-9 px-3 font-extrabold text-xs rounded-sm border transition-all cursor-pointer text-center ${
                      selectedSize === sz
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and CTAs Row */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            
            {/* Quantity Selector */}
            <div className="flex items-center bg-gray-100 rounded-sm">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer text-lg font-semibold"
              >
                -
              </button>
              <span className="w-10 text-center font-bold text-sm text-gray-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer text-lg font-semibold"
              >
                +
              </button>
            </div>

            {/* Buy Now Button (Solid Black, sharp corners like in screenshot) */}
            <button
              onClick={() => onBuyNow(product, selectedSize, selectedColor)}
              disabled={product.stock === 0}
              className="bg-black hover:bg-gray-900 text-white font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-sm transition-all cursor-pointer min-h-[40px]"
            >
              Buy Now
            </button>

            {/* Add to Cart Button (Solid Orange, sharp corners like in screenshot) */}
            <button
              onClick={handleAddToCartClick}
              disabled={product.stock === 0}
              className="bg-[#ff5c00] hover:bg-[#e04f00] text-white font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-sm transition-all cursor-pointer min-h-[40px] flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              {addedFeedback ? 'Added!' : 'Add to Cart'}
            </button>
          </div>

          {/* WhatsApp Button (Vibrant Green, Full-width, clean style) */}
          <button
            onClick={() => window.open(`https://wa.me/8809678123456?text=Hi,%20I'm%20interested%20in%20buying%20${encodeURIComponent(product.name)}.%20Product%20Link:%20${encodeURIComponent(window.location.href)}`, '_blank')}
            className="w-full bg-[#00a82f] hover:bg-[#009028] text-white py-3.5 rounded-sm font-bold text-center flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer text-sm"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.414 9.863-9.847.002-2.63-1.023-5.101-2.887-6.967C16.58 1.952 14.106.927 11.49.927c-5.439 0-9.864 4.415-9.867 9.851-.001 1.714.453 3.39 1.316 4.873L1.93 21.32l5.825-1.526zM15.86 12.93c-.272-.136-1.61-.795-1.86-.886-.25-.09-.432-.136-.613.136-.182.273-.704.886-.863 1.068-.159.182-.318.205-.59.069-.272-.136-1.15-.424-2.19-1.353-.809-.721-1.355-1.613-1.514-1.886-.159-.273-.017-.42.119-.556.122-.122.272-.318.408-.477.136-.159.182-.273.272-.455.09-.182.046-.341-.023-.477-.069-.136-.613-1.477-.84-2.023-.222-.534-.443-.46-.613-.469-.159-.009-.341-.009-.523-.009s-.477.069-.727.341c-.25.273-.954.932-.954 2.273s.977 2.636 1.114 2.818c.136.182 1.92 2.932 4.654 4.113.65.28 1.157.447 1.554.573.653.208 1.248.179 1.717.109.523-.078 1.61-.659 1.837-1.295.227-.636.227-1.182.159-1.295-.068-.113-.25-.182-.523-.318z"/>
            </svg>
            WhatsApp
          </button>

          {/* Return & Warranty info block */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 space-y-3.5 text-xs text-gray-700">
            <h3 className="font-bold text-gray-900 tracking-wide uppercase">Return & Warranty:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4 text-brand-accent shrink-0" />
                <span>Change of Mind</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#ff5c00] shrink-0" />
                <span>14 days easy return</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Warranty not available</span>
              </div>
            </div>
          </div>

          {/* Category / Tags listing */}
          <div className="space-y-1.5 pt-2 text-xs font-semibold text-gray-500">
            <div>
              <span className="text-gray-400 font-medium">Categories:</span> <span className="text-gray-900 font-bold">{product.category}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Tags:</span> <span className="text-gray-900 font-bold">{product.category}, {product.name.split(' ').slice(-2).join(' ')}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs description review */}
      <div className="border-t border-gray-200 pt-8 mt-12">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-1.5 px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider transition-all border ${
              activeTab === 'details'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-1.5 px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider transition-all border ${
              activeTab === 'reviews'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Reviews ({productReviews.length})
          </button>
        </div>

        <div className="py-2 text-gray-700 leading-relaxed font-sans text-sm bg-white border border-gray-100 rounded-lg p-6">
          {activeTab === 'details' ? (
            <div className="space-y-4">
              <p className="font-bold text-gray-900 text-base">{product.name}</p>
              <div 
                className="text-gray-600 leading-relaxed space-y-1"
                dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(product.description || '') }}
              />
              
              <div className="pt-4 space-y-2">
                <p className="font-bold text-gray-900 uppercase text-xs tracking-wider">Key features:</p>
                <ul className="list-disc list-inside space-y-1.5 text-gray-600 pl-2">
                  {product.features && product.features.length > 0 ? (
                    product.features.map((feat, idx) => (
                      <li key={idx} className="list-none flex items-start gap-2">
                        <span className="text-gray-400 shrink-0 select-none">-</span>
                        <span>{feat}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="list-none flex items-start gap-2">
                        <span className="text-gray-400 shrink-0 select-none">-</span>
                        <span>Premium craftsmanship and elegant build quality</span>
                      </li>
                      <li className="list-none flex items-start gap-2">
                        <span className="text-gray-400 shrink-0 select-none">-</span>
                        <span>Designed with fine aesthetics to complement modern decors</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {productReviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {productReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white p-6 rounded-lg border border-gray-100 shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1 text-amber-400 mb-3">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 italic leading-relaxed font-sans mb-4">
                          "{rev.comment}"
                        </p>
                      </div>

                      <div className="flex items-center gap-3 border-t border-gray-50 pt-3">
                        <img
                          src={rev.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150'}
                          alt={rev.userName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-zinc-950">{rev.userName}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-600" />
                              Verified Purchaser
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">• {rev.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No reviews yet for this product.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related items using official ProductCard */}
      <div className="border-t border-gray-100 pt-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">
            Related Products
          </h2>
          <a
            href="/shop"
            className="bg-black text-white hover:bg-gray-800 text-[11px] font-bold px-4 py-2 rounded-sm uppercase tracking-wider transition-colors cursor-pointer"
          >
            View More
          </a>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayRelated.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onQuickView={(prod) => {
                const slug = getProductSlug(prod.name, prod.id);
                window.history.pushState(null, '', `/product/${slug}`);
                window.dispatchEvent(new Event('popstate'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.some((w) => w.id === p.id)}
            />
          ))}
        </div>
      </div>

      {/* Recently Viewed Products section */}
      {recentlyViewedIds.length > 1 && (
        <div className="border-t border-gray-100 pt-10 mt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">
              Recently Viewed
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentlyViewedIds
              .filter(id => id !== product.id)
              .map(id => PRODUCTS.find(p => p.id === id))
              .filter((p): p is Product => p !== undefined)
              .slice(0, 4)
              .map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onQuickView={(prod) => {
                    const slug = getProductSlug(prod.name, prod.id);
                    window.history.pushState(null, '', `/product/${slug}`);
                    window.dispatchEvent(new Event('popstate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.some((w) => w.id === p.id)}
                />
              ))}
          </div>
        </div>
      )}

    </div>
  );
}
