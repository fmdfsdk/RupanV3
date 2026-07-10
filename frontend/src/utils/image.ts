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
