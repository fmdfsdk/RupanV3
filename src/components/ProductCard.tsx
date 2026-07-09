/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Heart, Eye, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string, qty?: number) => void;
  onBuyNow: (product: Product, size: string, color: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export default function ProductCard({
  product,
  onQuickView,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  // Calculate discount percentage
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0].name : 'Default';
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size';
    onAddToCart(product, defaultSize, defaultColor, 1);
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0].name : 'Default';
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size';
    onBuyNow(product, defaultSize, defaultColor);
  };

  const handleProductClick = () => {
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    window.history.pushState(null, '', `/product/${slug}`);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-white rounded-md overflow-hidden transition-all duration-300 border border-gray-200 flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image Container (Perfect square, centered image, padded) */}
      <div 
        onClick={handleProductClick}
        className="relative aspect-square bg-white flex items-center justify-center p-3.5 cursor-pointer border-b border-gray-100 overflow-hidden"
      >
        <img
          src={product.images[0] || undefined}
          alt={product.name}
          className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Top-left Discount Badge (Dark charcoal box like in screenshot) */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-[#1e1e1e] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Top-right Heart Toggle (Subtle hover button on desktop, always visible on mobile) */}
        <button
          id={`wishlist-toggle-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-300 shadow-xs cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100 translate-y-0 md:-translate-y-1 md:group-hover:translate-y-0 ${
            isWishlisted
              ? 'bg-red-50 text-red-500'
              : 'bg-white hover:bg-red-50 text-gray-400 hover:text-red-500'
          }`}
          title="Add to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Floating Quick View Eye button on Hover */}
        <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 flex items-center justify-center ${
          hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex items-center gap-1.5 bg-white text-[#ff5c00] font-bold text-[11px] py-2 px-3.5 rounded-full shadow-md hover:bg-[#ff5c00] hover:text-white transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-3.5 flex-1 flex flex-col justify-between bg-white text-left">
        <div>
          {/* Product Title */}
          <h4 
            onClick={handleProductClick}
            className="font-sans font-medium text-[13px] text-gray-900 hover:text-[#ff5c00] cursor-pointer line-clamp-2 min-h-[36px] mb-1 leading-snug transition-colors"
          >
            {product.name}
          </h4>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-1.5 mb-1.5">
            {product.discountPrice ? (
              <>
                <span className="text-sm font-bold text-[#ff5c00]">
                  {product.discountPrice.toLocaleString('en-IN')}৳
                </span>
                <span className="text-[11px] text-gray-400 line-through">
                  {product.price.toLocaleString('en-IN')}৳
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-[#ff5c00]">
                {product.price.toLocaleString('en-IN')}৳
              </span>
            )}
          </div>

          {/* Rating Stars - Left aligned */}
          {product.rating > 0 ? (
            <div className="flex items-center gap-1" title={`${product.rating} out of 5 stars`}>
              <div className="flex text-[11px] leading-none">
                {[1, 2, 3, 4, 5].map((star) => {
                  const ratingRounded = Math.round(product.rating);
                  return (
                    <span
                      key={star}
                      className={star <= ratingRounded ? 'text-[#ff5c00]' : 'text-gray-200'}
                    >
                      ★
                    </span>
                  );
                })}
              </div>
              <span className="text-[10px] text-gray-400 font-sans">({product.reviewsCount})</span>
            </div>
          ) : (
            <div className="text-[10px] text-gray-300 font-sans italic">No reviews yet</div>
          )}

          {/* Quick Buy Buttons */}
          <div className="mt-4 pt-3.5 border-t border-gray-100 flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 border border-[#ff5c00] text-[#ff5c00] hover:bg-[#ff5c00] hover:text-white transition-all duration-300 py-1.5 rounded-md text-[11px] font-extrabold text-center cursor-pointer select-none"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuy}
              className="flex-1 bg-[#ff5c00] hover:bg-[#cc4a00] text-white transition-all duration-300 py-1.5 rounded-md text-[11px] font-extrabold text-center cursor-pointer select-none shadow-sm"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
