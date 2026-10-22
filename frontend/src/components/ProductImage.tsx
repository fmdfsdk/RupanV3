import React, { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  loading?: 'lazy' | 'eager';
  style?: React.CSSProperties;
}

/**
 * Smart product image with:
 *  - Shimmer skeleton while loading
 *  - Animated icon placeholder on error (no ugly broken image or fallback photo)
 */
export default function ProductImage({
  src,
  alt,
  className = 'max-w-full max-h-full object-contain',
  containerClassName = 'w-full h-full',
  referrerPolicy = 'no-referrer',
  loading = 'lazy',
  style,
}: ProductImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Shimmer skeleton shown while image is fetching */}
      {status === 'loading' && (
        <div className="absolute inset-0 overflow-hidden bg-gray-100 rounded-sm">
          <div
            className="w-full h-full"
            style={{
              background: 'linear-gradient(90deg, #f0f0f0 25%, #fafafa 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Error state — subtle icon, no random photo */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-1.5">
          <svg
            className="w-9 h-9 text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
            style={{ animation: 'pulse 2.5s ease-in-out infinite' }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span className="text-[9px] text-gray-300 font-semibold tracking-widest uppercase">No Image</span>
        </div>
      )}

      {/* Real image — fades in when loaded, hidden on error */}
      {status !== 'error' && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
          referrerPolicy={referrerPolicy}
          loading={loading}
          style={style}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
}
