import { useEffect } from 'react';

const SITE_NAME = 'Rupan';
const BASE_URL = 'https://www.myrupan.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/Rupan%20Logo%20Final.png`;
const TWITTER_HANDLE = '@RupanBD';

interface SEOConfig {
  /** Browser tab title. Auto-appends " | Rupan" if not already present. */
  title: string;
  /** Meta description — keep under 160 characters. */
  description: string;
  /** Canonical URL path, e.g. "/shop" or "/product/shirt-4083". Defaults to current path. */
  canonical?: string;
  /** Open Graph image URL. Falls back to Rupan logo. */
  ogImage?: string;
  /** Open Graph type. Defaults to "website". */
  ogType?: 'website' | 'product' | 'article';
  /** robots directive. Defaults to "index, follow". */
  robots?: string;
  /** Additional JSON-LD structured data objects to inject into <head>. */
  jsonLd?: object | object[];
  /** article:published_time — for blog posts */
  publishedTime?: string;
  /** article:author — for blog posts */
  author?: string;
}

// --- Helper: upsert a <meta> tag by name or property ---
function upsertMeta(selector: string, attr: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const [attrName, attrValue] = attr.split('=');
    el.setAttribute(attrName, attrValue.replace(/"/g, ''));
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

// --- Helper: upsert a <link> tag by rel ---
function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
  }
}

// --- Helper: inject JSON-LD script blocks ---
function injectJsonLd(id: string, data: object): HTMLScriptElement {
  // Remove existing script with same id
  document.getElementById(id)?.remove();
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data, null, 0);
  document.head.appendChild(script);
  return script;
}

/**
 * useSEO — Centralized SEO hook for the Rupan storefront.
 *
 * Sets document.title, meta description, canonical URL, Open Graph tags,
 * Twitter Card tags, robots directive, and optional JSON-LD structured data.
 * All changes are cleanly reversed on component unmount.
 *
 * Usage:
 * ```tsx
 * useSEO({
 *   title: 'Shop All Products',
 *   description: 'Browse Rupan\'s full collection...',
 *   canonical: '/shop',
 * });
 * ```
 */
export function useSEO(config: SEOConfig) {
  const {
    title,
    description,
    canonical,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    robots = 'index, follow',
    jsonLd,
    publishedTime,
    author,
  } = config;

  useEffect(() => {
    // --- 1. Document title ---
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const prevTitle = document.title;
    document.title = fullTitle;

    // --- 2. Canonical URL ---
    const canonicalHref = canonical
      ? `${BASE_URL}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
      : `${BASE_URL}${window.location.pathname}`;
    upsertLink('canonical', canonicalHref);

    // --- 3. Robots ---
    upsertMeta('meta[name="robots"]', 'name=robots', robots);

    // --- 4. Primary meta description ---
    const clampedDesc = description.length > 160 ? description.slice(0, 157) + '...' : description;
    upsertMeta('meta[name="description"]', 'name=description', clampedDesc);

    // --- 5. Open Graph ---
    const canonicalUrl = canonicalHref;
    upsertMeta('meta[property="og:title"]', 'property=og:title', fullTitle);
    upsertMeta('meta[property="og:description"]', 'property=og:description', clampedDesc);
    upsertMeta('meta[property="og:image"]', 'property=og:image', ogImage);
    upsertMeta('meta[property="og:url"]', 'property=og:url', canonicalUrl);
    upsertMeta('meta[property="og:type"]', 'property=og:type', ogType);
    upsertMeta('meta[property="og:site_name"]', 'property=og:site_name', SITE_NAME);
    upsertMeta('meta[property="og:locale"]', 'property=og:locale', 'bn_BD');

    // article-specific OG tags
    if (ogType === 'article') {
      if (publishedTime) {
        upsertMeta('meta[property="article:published_time"]', 'property=article:published_time', publishedTime);
      }
      if (author) {
        upsertMeta('meta[property="article:author"]', 'property=article:author', author);
      }
      upsertMeta('meta[property="article:publisher"]', 'property=article:publisher', BASE_URL);
    }

    // --- 6. Twitter / X Card ---
    upsertMeta('meta[name="twitter:card"]', 'name=twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:site"]', 'name=twitter:site', TWITTER_HANDLE);
    upsertMeta('meta[name="twitter:title"]', 'name=twitter:title', fullTitle);
    upsertMeta('meta[name="twitter:description"]', 'name=twitter:description', clampedDesc);
    upsertMeta('meta[name="twitter:image"]', 'name=twitter:image', ogImage);

    // --- 7. JSON-LD structured data ---
    const injectedScripts: HTMLScriptElement[] = [];
    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      items.forEach((schema, idx) => {
        const schemaType = (schema as any)['@type'] || `schema-${idx}`;
        const id = `jsonld-${String(schemaType).toLowerCase().replace(/\s+/g, '-')}-${idx}`;
        injectedScripts.push(injectJsonLd(id, schema));
      });
    }

    // --- Cleanup on unmount ---
    return () => {
      document.title = prevTitle;
      // Restore canonical to homepage default
      upsertLink('canonical', `${BASE_URL}/`);
      // Remove any injected JSON-LD scripts
      injectedScripts.forEach(s => s.remove());
      // Restore robots
      upsertMeta('meta[name="robots"]', 'name=robots', 'index, follow');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonical, ogImage, ogType, robots, publishedTime, author]);
}

// ─── Exported JSON-LD builder helpers ───────────────────────────────────────

/** Build Organization JSON-LD for the homepage */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Rupan',
    url: BASE_URL,
    logo: `${BASE_URL}/assets/Rupan%20Logo%20Final.png`,
    sameAs: [
      'https://www.facebook.com/rupanbd',
      'https://www.instagram.com/rupanbd',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Bengali', 'English'],
    },
  };
}

/** Build WebSite JSON-LD with SearchAction for the homepage */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Rupan',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/product-search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Build BreadcrumbList JSON-LD */
export function buildBreadcrumbSchema(
  crumbs: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${BASE_URL}${crumb.url}`,
    })),
  };
}

/** Build Product JSON-LD with full fields */
export function buildProductSchema(product: {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  images?: string[];
  sku?: string;
  brand?: string;
  category?: string;
  material?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  rating?: number;
  reviewsCount?: number;
  slug?: string;
}) {
  const price = product.discountPrice ?? product.price;
  const url = product.slug
    ? `${BASE_URL}/product/${product.slug}`
    : `${BASE_URL}/product/${product.id}`;

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description || product.name,
    image: product.images ?? [],
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Rupan',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'BDT',
      price: price.toFixed(2),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Rupan' },
    },
  };

  // Optional fields
  if (product.category) schema['category'] = product.category;
  if (product.material) schema['material'] = product.material;

  // AggregateRating — only add if we have real review data
  if (product.rating && product.reviewsCount && product.reviewsCount > 0) {
    schema['aggregateRating'] = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviewsCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
}

/** Build BlogPosting JSON-LD for blog detail pages */
export function buildBlogPostingSchema(post: {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  image?: string;
  date?: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.image || DEFAULT_OG_IMAGE,
    datePublished: post.date || new Date().toISOString(),
    dateModified: post.date || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Rupan Editorial',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Rupan',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/assets/Rupan%20Logo%20Final.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.id}`,
    },
  };
}

/** Build LocalBusiness JSON-LD for About / Contact pages */
export function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: 'Rupan',
    url: BASE_URL,
    logo: `${BASE_URL}/assets/Rupan%20Logo%20Final.png`,
    image: `${BASE_URL}/assets/Rupan%20Logo%20Final.png`,
    description: 'Rupan – বাংলাদেশের প্রিমিয়াম ফ্যাশন ব্র্যান্ড। পাঞ্জাবি, শার্ট, টি-শার্ট ও আনুষাঙ্গিক পণ্য।',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BD',
      addressLocality: 'Dhaka',
    },
    areaServed: 'BD',
    currenciesAccepted: 'BDT',
    paymentAccepted: 'Cash, bKash, Nagad, Card',
    priceRange: '৳৳',
    sameAs: [
      'https://www.facebook.com/rupanbd',
      'https://www.instagram.com/rupanbd',
    ],
  };
}
