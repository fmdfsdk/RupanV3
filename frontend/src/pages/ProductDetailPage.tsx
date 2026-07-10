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
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);

      const getProductSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      };

      // 1. Try to find in already loaded store products (offline/sync cache)
      const searchId = id.trim().toLowerCase();
      const numMatch = searchId.match(/\d+$/);
      const searchNum = numMatch ? parseInt(numMatch[0], 10) : null;

      const foundLocal = products.find(p => {
        const pId = String(p.id).toLowerCase();
        const pSlug = String(p.slug || '').toLowerCase();
        
        if (pId === searchId || getProductSlug(p.name) === searchId || pSlug === searchId) {
          return true;
        }

        if (searchNum !== null) {
          const pNumMatch = pId.match(/\d+$/);
          if (pNumMatch) {
            const pNum = parseInt(pNumMatch[0], 10);
            if (pNum === searchNum || pNum === searchNum - 3000 || pNum === searchNum + 3000) {
              return true;
            }
          }
        }
        return false;
      });

      if (foundLocal) {
        // If online, fetch full details from DB just in case
        if (isSupabaseOnline) {
          try {
            const data = await productService.fetchProductByIdOrSlug(foundLocal.id);
            if (data) {
              setProduct(data);
              setLoading(false);
              return;
            }
          } catch (e) {}
        }
        setProduct(foundLocal);
        setLoading(false);
        return;
      }

      // 2. Fetch directly from DB by ID or Slug if not in local cache
      if (isSupabaseOnline) {
        try {
          const data = await productService.fetchProductByIdOrSlug(id);
          if (data) {
            setProduct(data);
          }
        } catch (e) {
          console.error("Error loading product details:", e);
        }
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id, products, isSupabaseOnline]);

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
