import React from 'react';

interface HeroBanner {
  id?: string;
  title?: string;
  highlight?: string;
  subtitle?: string;
  bgUrl: string;
  ctaText?: string;
  category?: string;
  overlayOpacity?: number;
}

interface HeroCarouselProps {
  heroBanners: HeroBanner[];
  heroSlide: number;
  setHeroSlide: React.Dispatch<React.SetStateAction<number>>;
  setSelectedCategory: (cat: string) => void;
  navigate: (path: string) => void;
  sideBanner?: {
    image?: string;
    link?: string;
    button_text?: string;
    is_enabled?: boolean;
  };
}

export default function HeroCarousel({
  heroBanners,
  heroSlide,
  setHeroSlide,
  setSelectedCategory,
  navigate,
  sideBanner
}: HeroCarouselProps) {
  const currentBanner = heroBanners[heroSlide] || heroBanners[0];
  const opacityVal = currentBanner.overlayOpacity !== undefined ? currentBanner.overlayOpacity : 50;

  const hasTitle = Boolean(currentBanner.title && currentBanner.title.trim());
  const hasHighlight = Boolean(currentBanner.highlight && currentBanner.highlight.trim());
  const hasSubtitle = Boolean(currentBanner.subtitle && currentBanner.subtitle.trim());
  const hasCta = Boolean(currentBanner.ctaText && currentBanner.ctaText.trim());
  const hasAnyText = hasTitle || hasHighlight || hasSubtitle || hasCta;

  const handleTargetNavigation = (targetLink?: string) => {
    if (!targetLink || !targetLink.trim()) {
      setSelectedCategory('All');
      navigate('/shop');
      return;
    }

    const link = targetLink.trim();

    // 1. External URL (e.g. https://...)
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.location.href = link;
      return;
    }

    // 2. Relative internal path (e.g. /offers, /blog/landing-page, /shop?category=panjabi)
    if (link.startsWith('/')) {
      navigate(link);
      return;
    }

    // 3. Category name fallback (e.g. Panjabi, Saree, Watch)
    setSelectedCategory(link);
    navigate('/shop');
  };

  const isSideBannerActive = sideBanner?.is_enabled !== false;

  return (
    <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 animate-in fade-in duration-700">
      <div className={`grid grid-cols-1 ${isSideBannerActive ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-4`}>
        {/* Main Sliding Hero Carousel */}
        <div className={`col-span-1 ${isSideBannerActive ? 'lg:col-span-3' : 'lg:col-span-1 w-full'} relative rounded-lg overflow-hidden h-[340px] sm:h-[420px] shadow-sm select-none group`}>
          <div className="absolute inset-0 transition-all duration-700 ease-in-out">
            <img 
              src={currentBanner.bgUrl} 
              alt={currentBanner.highlight || currentBanner.title || 'Hero Banner'}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Custom Opacity Overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent transition-opacity duration-300 pointer-events-none" 
              style={{ opacity: opacityVal / 100 }}
            />
            
            <div 
              onClick={() => {
                if (!hasAnyText && currentBanner.category) {
                  handleTargetNavigation(currentBanner.category);
                }
              }}
              className={`absolute inset-0 p-8 md:p-12 flex flex-col justify-between text-white z-10 text-left ${
                !hasAnyText && currentBanner.category ? 'cursor-pointer' : ''
              }`}
            >
              {hasAnyText ? (
                <div className="space-y-3.5 max-w-md sm:max-w-lg">
                  {hasTitle && (
                    <span className="inline-block bg-[#ff5c00] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-sm">
                      {currentBanner.title}
                    </span>
                  )}
                  {hasHighlight && (
                    <h2 className="font-sans font-black text-2xl sm:text-4xl tracking-tight leading-none uppercase">
                      {currentBanner.highlight}
                    </h2>
                  )}
                  {hasSubtitle && (
                    <p className="text-xs sm:text-sm text-gray-200 font-medium tracking-wide">
                      {currentBanner.subtitle}
                    </p>
                  )}
                  {hasCta && (
                    <div className="pt-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTargetNavigation(currentBanner.category);
                        }}
                        className="bg-white text-[#ff5c00] hover:bg-gray-100 font-extrabold text-[11px] sm:text-xs px-5 py-2.5 rounded-full uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-md"
                      >
                        {currentBanner.ctaText}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono tracking-widest text-white/50">
                <span>WWW.RUPAN.COM</span>
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div className="absolute bottom-5 right-5 z-20 flex gap-2">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  heroSlide === idx ? 'bg-[#ff5c00] w-6' : 'bg-white/50 hover:bg-white'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Arrow Controls */}
          <button 
            onClick={() => setHeroSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 z-20 cursor-pointer text-lg font-bold"
          >
            ‹
          </button>
          <button 
            onClick={() => setHeroSlide((prev) => (prev + 1) % heroBanners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 z-20 cursor-pointer text-lg font-bold"
          >
            ›
          </button>
        </div>

        {/* Right Side Promo Banner (Image-Only with Optional CTA Button) */}
        {sideBanner?.is_enabled !== false && (
          <div 
            onClick={() => handleTargetNavigation(sideBanner?.link)}
            className="hidden lg:flex relative rounded-xl overflow-hidden h-[340px] sm:h-[420px] shadow-sm group cursor-pointer bg-zinc-950 select-none border border-gray-100"
          >
            <img 
              src={sideBanner?.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop'} 
              alt="Side Promo Banner" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              referrerPolicy="no-referrer" 
            />

            {/* Optional Floating CTA Button */}
            {sideBanner?.button_text && sideBanner.button_text.trim() !== '' && (
              <div className="absolute bottom-5 inset-x-5 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTargetNavigation(sideBanner.link);
                  }}
                  className="w-full bg-black/85 hover:bg-black text-white font-extrabold text-[11px] py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg backdrop-blur-xs text-center border border-white/10"
                >
                  {sideBanner.button_text}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
