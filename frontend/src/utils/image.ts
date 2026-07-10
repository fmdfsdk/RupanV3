/**
 * Returns a CDN optimized, compressed, and resized WebP image URL using wsrv.nl proxy.
 * This dramatically speeds up page loading times for large third-party seller images.
 */
export function getOptimizedImageUrl(url: string, width = 600): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600';
  }
  
  // If it's a local/relative asset, a base64 string, or already optimized, return as is
  if (url.startsWith('/') || url.startsWith('data:') || url.includes('placeholder') || url.includes('unsplash.com')) {
    return url;
  }
  
  // Clean protocol for wsrv.nl
  const cleanUrl = url.replace(/^https?:\/\//, '');
  return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&q=80&output=webp`;
}

/**
 * Generates an SEO-friendly product URL slug with the numeric product ID appended.
 * Format: product-name-slug-{numericId}
 * Example: "men-s-ban-collar-cotton-shirt-4083"
 *
 * Appending the numeric ID means:
 *   1. Every URL is unique even if two products share a similar name.
 *   2. The product can always be found by extracting the trailing number — no slug DB column needed.
 *   3. Matches the pattern used by major BD dropshipping sites for familiarity.
 */
export function getProductSlug(name: string, productId: string): string {
  const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  // Extract numeric part from product ID (e.g. "mohasagor-4083" → "4083")
  const numMatch = String(productId).match(/\d+$/);
  const numericId = numMatch ? numMatch[0] : '';
  return numericId ? `${nameSlug}-${numericId}` : nameSlug;
}
