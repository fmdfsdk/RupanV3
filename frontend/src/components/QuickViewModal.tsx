/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { X, Star, Ruler, Truck, RotateCcw, ShieldCheck, Heart } from 'lucide-react';
import { Product } from '../types';
import { getOptimizedImageUrl } from '../utils/image';
import { formatDescriptionToHtml } from '../lib/formatter';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string, qty: number) => void;
  onBuyNow: (product: Product, size: string, color: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onOpenSizeGuide: (category: string) => void;
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onOpenSizeGuide
}: QuickViewModalProps) {
  const productColors = Array.isArray(product?.colors) ? product.colors : [];
  const productSizes = Array.isArray(product?.sizes) ? product.sizes : [];

  const [selectedImage, setSelectedImage] = useState(product?.images?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(productColors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(productSizes[0] || '');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images?.[0] || '');
      setSelectedColor(productColors[0]?.name || '');
      setSelectedSize(productSizes[0] || '');
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div 
        id="quickview-modal-backdrop"
        onClick={onClose} 
        className="absolute inset-0"
      />
      
      <div 
        id="quickview-modal-content"
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-y-auto md:overflow-hidden animate-in fade-in zoom-in-95 duration-300 z-10 flex flex-col md:flex-row max-h-[92vh] md:max-h-[85vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-500 hover:text-brand-text shadow-md cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Gallery */}
        <div className="w-full md:w-1/2 p-4 md:p-6 bg-gray-50 flex flex-col justify-between md:overflow-y-auto">
          <div className="flex-1 flex items-center justify-center min-h-[250px] max-h-[350px] md:max-h-[450px] rounded-xl overflow-hidden bg-white relative">
            <img
              src={getOptimizedImageUrl(selectedImage, 600)}
              alt={product.name}
              className="w-full h-full object-contain transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 mt-4 justify-center">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 bg-white transition-all cursor-pointer ${
                    selectedImage === img
                      ? 'border-brand-primary shadow-xs'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(img, 150)}
                    alt={`${product.name} thumbnail ${i}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Configuration & Purchase */}
        <div className="w-full md:w-1/2 p-6 md:p-8 md:overflow-y-auto flex flex-col">
          {/* Category, Rating */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-brand-primary tracking-widest uppercase">
              {product.category}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold text-gray-700 ml-1">{product.rating}</span>
              </div>
              <span className="text-xs text-gray-400">({product.reviewsCount} Reviews)</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="font-display text-xl md:text-2xl font-bold text-brand-text mb-1 leading-tight">
            {product.name}
          </h2>
          {product.sku && (
            <span className="text-[11px] font-mono text-gray-400 block mb-3">
              Product Code: <strong className="text-gray-600 font-extrabold">{product.sku}</strong>
            </span>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5 p-3 rounded-xl bg-gray-50/70 border border-gray-100">
            {product.discountPrice ? (
              <>
                <span className="text-2xl font-extrabold text-brand-primary">
                  ৳{product.discountPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ৳{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md ml-auto">
                  Save ৳{(product.price - product.discountPrice).toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className="text-2xl font-extrabold text-brand-primary">
                ৳{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Short description */}
          <div 
            className="text-xs text-gray-600 mb-5 leading-relaxed space-y-1 max-h-40 overflow-y-auto pr-1 bg-gray-50/50 p-3 rounded-lg border border-gray-100"
            dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(product.description || '') }}
          />

          {/* Color swatches selector */}
          {productColors.length > 0 && (
            <div className="mb-4">
              <span className="block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wider">
                Selected Color: <strong className="text-brand-primary font-semibold">{selectedColor}</strong>
              </span>
              <div className="flex items-center gap-2">
                {productColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${
                      selectedColor === color.name
                        ? 'border-brand-primary bg-blue-50/30 text-brand-primary font-bold ring-2 ring-brand-primary/20'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${color.class}`} />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Select & Size Guide Link */}
          {productSizes.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Select Size: <strong className="text-brand-primary font-semibold">{selectedSize}</strong>
                </span>
                <button
                  onClick={() => onOpenSizeGuide(product.category)}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-accent hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Size Guide
                </button>
              </div>
              <div className="flex gap-2">
                {productSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-11 h-11 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-brand-primary text-white shadow-md'
                        : 'border border-gray-200 text-gray-500 hover:border-brand-primary hover:text-brand-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Stock Indicator */}
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
            <div>
              <span className="block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wider">
                Quantity
              </span>
              <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 font-bold hover:text-brand-primary hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-brand-text">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 font-bold hover:text-brand-primary hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Availability
              </span>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {product.stock} Units In Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                  Out Of Stock
                </span>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            <button
              onClick={() => {
                onAddToCart(product, selectedSize, selectedColor, quantity);
                onClose();
              }}
              disabled={product.stock === 0}
              className="col-span-2 border-2 border-brand-primary text-brand-primary hover:bg-blue-50/50 font-bold text-sm py-3 px-4 rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              Add To Cart
            </button>
            <button
              onClick={() => {
                onBuyNow(product, selectedSize, selectedColor);
                onClose();
              }}
              disabled={product.stock === 0}
              className="col-span-2 bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm py-3 px-4 rounded-xl text-center shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              Buy Now
            </button>
            <button
              onClick={() => onToggleWishlist(product)}
              className={`col-span-1 border border-gray-200 hover:border-red-300 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isWishlisted ? 'bg-red-50 text-red-500 border-red-200' : 'text-gray-400 hover:text-red-500'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Core Trust Indicators */}
          <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-gray-100 text-center text-[10px] text-gray-500 font-semibold">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-brand-accent" />
              <span>Flat Shipping ৳60</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-brand-accent" />
              <span>7-Day Exchange</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-brand-accent" />
              <span>100% Authentic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
