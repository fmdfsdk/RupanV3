import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ProductDetail from '../components/ProductDetail';
import { productService } from '../services/productService';
import { Product } from '../types';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const isSupabaseOnline = useStore((state) => state.isSupabaseOnline);
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

  // Smart local matcher — checks exact ID, slug, computed name slug, or numeric suffix
  const smartMatch = (list: Product[], searchId: string) => list.find(p => {
    const pId = String(p.id).toLowerCase();
    const pSlug = String(p.slug || '').toLowerCase();
    const pName = p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
    return pId === searchId || pSlug === searchId || pName === searchId || pId.endsWith('-' + searchId);
  });

  // Extract the trailing numeric ID from a slug like "men-s-ban-collar-cotton-shirt-4083" → "4083"
  const extractNumericId = (slug: string): string | null => {
    const match = slug.match(/-(\d+)$/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    if (!id) return;

    const searchId = id.trim().toLowerCase();
    // Extract numeric suffix from new slug format (e.g. "men-s-ban-collar-cotton-shirt-4083" → "4083")
    const numericSuffix = extractNumericId(searchId);
    let cancelled = false;

    const resolve = async () => {
      setLoading(true);
      setProduct(null);

      // STEP 1: Check local 1000 products (instant — no network needed)
      // If URL has numeric suffix, try to find by that number first (very fast)
      let inLocal = numericSuffix
        ? products.find(p => String(p.id).endsWith('-' + numericSuffix))
        : undefined;
      if (!inLocal) inLocal = smartMatch(products, searchId);

      if (inLocal && !cancelled) {
        setProduct(inLocal);
        setLoading(false);
        // Silently upgrade to full DB data in background
        try {
          const full = await productService.fetchProductByIdOrSlug(inLocal.id);
          if (full && !cancelled) setProduct(full);
        } catch (_) {}
        return;
      }

      // STEP 2: Check full catalog index (all product IDs, loaded in background)
      let inIndex = numericSuffix
        ? catalogIndex.find(p => String(p.id).endsWith('-' + numericSuffix))
        : undefined;
      if (!inIndex) inIndex = smartMatch(catalogIndex, searchId);

      if (inIndex && !cancelled) {
        setProduct(inIndex);
        setLoading(false);
        try {
          const full = await productService.fetchProductByIdOrSlug(inIndex.id);
          if (full && !cancelled) setProduct(full);
        } catch (_) {}
        return;
      }

      // STEP 3: Direct DB fetch — guaranteed to work for:
      //   - Brand new customers with no cache (shared links)
      //   - Products not in first 1000 or catalog index
      //   - Numeric suffix slug: try "mohasagor-{num}" directly → instant match
      try {
        const lookupId = numericSuffix ? `mohasagor-${numericSuffix}` : id;
        let data = await productService.fetchProductByIdOrSlug(lookupId);
        // Fallback: try the full slug as-is
        if (!data && numericSuffix) {
          data = await productService.fetchProductByIdOrSlug(id);
        }
        if (data && !cancelled) {
          setProduct(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Direct DB fetch failed for product:', id, e);
      }

      if (!cancelled) setLoading(false);
    };

    resolve();

    return () => { cancelled = true; };
  }, [id, products, catalogIndex]);

  // Inject dynamic SEO Meta Tags and JSON-LD Structured Schema
  useEffect(() => {
    if (!product) return;

    // 1. Update Title and Meta Tags
    document.title = `${product.name} | Rupan`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', product.shortDescription || `Buy ${product.name} at Rupan. Premium quality guaranteed.`);

    // OpenGraph Tags
    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOGTag('og:title', product.name);
    updateOGTag('og:description', product.shortDescription || `Buy ${product.name} at Rupan.`);
    updateOGTag('og:image', product.images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600');
    updateOGTag('og:type', 'product');

    // 2. Inject JSON-LD Schema
    let jsonLdScript = document.getElementById('product-jsonld') as HTMLScriptElement;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'product-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    const price = product.discountPrice || product.price;
    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": product.images || [],
      "description": product.shortDescription,
      "sku": product.sku || product.id,
      "brand": {
        "@type": "Brand",
        "name": product.brand || "Rupan"
      },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "BDT",
        "price": price,
        "itemCondition": "https://schema.org/NewCondition",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    };

    jsonLdScript.text = JSON.stringify(schemaData);

    // Cleanup on unmount
    return () => {
      const script = document.getElementById('product-jsonld');
      if (script) script.remove();
    };
  }, [product]);

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
