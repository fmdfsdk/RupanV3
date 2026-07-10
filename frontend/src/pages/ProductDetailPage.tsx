import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ProductDetail from '../components/ProductDetail';
import { productService } from '../services/productService';
import { Product } from '../types';
import { useSEO, buildProductSchema, buildBreadcrumbSchema } from '../hooks/useSEO';



export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const products = useStore((state) => state.dbProducts);
  const catalogIndex = useStore((state) => state.productCatalogIndex);
  const wishlist = useStore((state) => state.wishlist);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const addToCart = useStore((state) => state.addToCart);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handleBuyNow = (p: Product, size: string, color: string) => {
    addToCart(p, size, color, 1);
    navigate('/checkout');
  };

  useEffect(() => {
    if (!id) return;

    const slug = id.trim().toLowerCase();
    // Extract the numeric code from the end of the slug (e.g. "shirt-4083" → "4083")
    const numMatch = slug.match(/-(\d+)$/);
    const numericId = numMatch ? numMatch[1] : null;

    let cancelled = false;

    const resolve = async () => {
      setLoading(true);
      setProduct(null);

      // Helper: find by numeric code or exact ID in any list
      const findIn = (list: Product[]) => {
        if (numericId) {
          return list.find(p => String(p.id).endsWith('-' + numericId));
        }
        return list.find(p => String(p.id).toLowerCase() === slug);
      };

      // STEP 1: Check local 1000 products (instant)
      const inLocal = findIn(products);
      if (inLocal && !cancelled) {
        setProduct(inLocal);
        setLoading(false);
        // Silently upgrade to full data from DB in background
        try {
          const full = await productService.fetchProductByIdOrSlug(inLocal.id);
          if (full && !cancelled) setProduct(full);
        } catch (_) {}
        return;
      }

      // STEP 2: Check full catalog index
      const inIndex = findIn(catalogIndex);
      if (inIndex && !cancelled) {
        setProduct(inIndex);
        setLoading(false);
        try {
          const full = await productService.fetchProductByIdOrSlug(inIndex.id);
          if (full && !cancelled) setProduct(full);
        } catch (_) {}
        return;
      }

      // STEP 3: Guaranteed DB fetch — works for brand new customers & shared links
      try {
        // numericId gives us a direct mohasagor-{num} lookup — very fast
        const lookupId = numericId ? `mohasagor-${numericId}` : id;
        const data = await productService.fetchProductByIdOrSlug(lookupId);
        if (data && !cancelled) {
          setProduct(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Product fetch failed:', id, e);
      }

      if (!cancelled) setLoading(false);
    };

    resolve();
    return () => { cancelled = true; };
  }, [id, products, catalogIndex]);

  // Product SEO — uses DB seoTitle/seoDescription when available
  const productSlug = product?.slug || id || '';
  const seoTitle = product
    ? (product.seoTitle || `${product.name} | ${product.category || 'পণ্য'} কিনুন | Rupan`)
    : 'পণ্য লোড হচ্ছে... | Rupan';
  const seoDescription = product
    ? (product.seoDescription || product.shortDescription || `Rupan-এ ${product.name} কিনুন। প্রিমিয়াম কোয়ালিটি, দ্রুত ডেলিভারি।`)
    : '';

  useSEO({
    title: seoTitle,
    description: seoDescription,
    canonical: product ? `/product/${productSlug}` : undefined,
    ogImage: product?.images?.[0],
    ogType: 'product',
    robots: 'index, follow',
    jsonLd: product
      ? [
          buildProductSchema({
            id: product.id,
            name: product.name,
            description: product.description,
            shortDescription: product.shortDescription,
            images: product.images,
            sku: product.sku,
            brand: product.brand,
            category: product.category,
            material: product.material,
            price: product.price,
            discountPrice: product.discountPrice,
            stock: product.stock,
            rating: product.rating,
            reviewsCount: product.reviewsCount,
            slug: productSlug,
          }),
          buildBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Shop', url: '/shop' },
            { name: product.category || 'Products', url: `/shop?category=${encodeURIComponent(product.category || '')}` },
            { name: product.name, url: `/product/${productSlug}` },
          ]),
        ]
      : undefined,
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#ff5c00] mx-auto"></div>
        <p className="text-sm text-gray-500 font-medium">Loading Product Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-display text-2xl font-bold uppercase text-red-600">Product Not Found</h2>
        <p className="text-sm text-gray-500">We could not find the product you are looking for.</p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm px-6 py-3 rounded-xl cursor-pointer"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.some((w) => w.id === product.id);

  return (
    <ProductDetail
      productId={product.id}
      selectedProduct={product}
      onAddToCart={addToCart}
      onBuyNow={handleBuyNow}
      onToggleWishlist={toggleWishlist}
      wishlist={wishlist}
      products={products}
      onOpenSizeGuide={(cat) => {
        useStore.getState().setSizeGuideCategory(cat);
        useStore.getState().setSizeGuideOpen(true);
      }}
      onNavigate={(page, category) => {
        if (page === 'shop') {
          if (category) {
            navigate(`/shop?category=${encodeURIComponent(category)}`);
          } else {
            navigate('/shop');
          }
        } else {
          navigate(page);
        }
      }}
    />
  );
}
