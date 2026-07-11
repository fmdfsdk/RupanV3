/**
 * Telemetry — Marketing & Analytics Integration Layer
 * =====================================================
 * Handles: Meta Pixel (browser), Meta CAPI (server-side),
 *          Google Tag Manager, Google Analytics 4.
 *
 * All browser events are dual-fired:
 *   1. Browser pixel (fbq)   — fast, client-side
 *   2. Server CAPI via /api/meta-capi — bypass ad-blockers & iOS ITP
 *
 * GA4 & GTM are properly initialized with onload guards.
 */

import { Product, Order } from '../types';
import { useStore } from '../store/useStore';

// ─── Module-level state (persists across hot reloads) ────────────────────────
let _isPixelLoaded        = typeof window !== 'undefined' && !!(window as any).isPixelLoaded;
let _isGTMConfigured      = typeof window !== 'undefined' && !!(window as any).isGTMConfigured;
let _isGAConfigured       = typeof window !== 'undefined' && !!(window as any).isGAConfigured;
const _initializedPixels  = new Set<string>();

let _capiConfig: {
  pixelId?:        string;
  accessToken?:    string;
  testEventCode?:  string;
} = {};

// ─── Public Interface ────────────────────────────────────────────────────────

export interface TelemetryConfig {
  metaPixelId?:         string;
  metaTestEventCode?:   string;
  metaCapiAccessToken?: string;
  googleTagManagerId?:  string;
  googleAnalyticsId?:   string;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Generate a unique Event ID for deduplication (CAPI + Pixel matching) */
export const generateEventId = (eventName: string): string => {
  const ts  = Date.now();
  const rnd = Math.floor(100000 + Math.random() * 900000);
  return `evt-${eventName.toLowerCase()}-${ts}-${rnd}`;
};

/** Read a cookie value by name */
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : undefined;
};

// ─── Initialization ──────────────────────────────────────────────────────────

/**
 * Initialize and inject all tracking scripts based on Supabase settings.
 * Safe to call multiple times — uses flags to prevent double-init.
 */
export const initializeTelemetry = (config: TelemetryConfig): void => {
  if (typeof window === 'undefined') return;

  const {
    metaPixelId,
    metaTestEventCode,
    metaCapiAccessToken,
    googleTagManagerId,
    googleAnalyticsId,
  } = config;

  // Store CAPI config for use in server-side event calls
  _capiConfig = {
    pixelId:       metaPixelId,
    accessToken:   metaCapiAccessToken,
    testEventCode: metaTestEventCode,
  };

  // ── 1. Google Tag Manager ──────────────────────────────────────────────────
  if (googleTagManagerId && !_isGTMConfigured) {
    try {
      const w = window as any;
      // Ensure dataLayer exists before GTM injection
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

      const gtmScript = document.createElement('script');
      gtmScript.async = true;
      gtmScript.src   = `https://www.googletagmanager.com/gtm.js?id=${googleTagManagerId}`;
      document.head.appendChild(gtmScript);

      _isGTMConfigured             = true;
      w.isGTMConfigured            = true;
      console.log(`[Telemetry] ✅ GTM initialized: ${googleTagManagerId}`);
    } catch (e) {
      console.error('[Telemetry] ❌ GTM init error:', e);
    }
  }

  // ── 2. Google Analytics 4 ─────────────────────────────────────────────────
  if (googleAnalyticsId && !_isGAConfigured) {
    try {
      const w = window as any;

      // Initialize gtag dataLayer queue if not already set
      if (!w.gtag) {
        w.dataLayer = w.dataLayer || [];
        w.gtag = function () { w.dataLayer.push(arguments); };
        w.gtag('js', new Date());
      }

      // Load the GA4 measurement script
      const gaScript    = document.createElement('script');
      gaScript.async    = true;
      gaScript.src      = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;

      // ⚠️ CRITICAL: gtag('config') must run AFTER the script is loaded
      gaScript.onload = () => {
        w.gtag('config', googleAnalyticsId, { send_page_view: false });
        console.log(`[Telemetry] ✅ GA4 configured: ${googleAnalyticsId}`);
      };

      document.head.appendChild(gaScript);
      _isGAConfigured  = true;
      w.isGAConfigured = true;
    } catch (e) {
      console.error('[Telemetry] ❌ GA4 init error:', e);
    }
  }

  // ── 3. Meta Pixel ─────────────────────────────────────────────────────────
  if (metaPixelId) {
    try {
      const w = window as any;

      // Safety bootstrap if index.html was blocked or script wasn't loaded
      if (!w.fbq) {
        w.fbq = function () {
          w.fbq.callMethod
            ? w.fbq.callMethod.apply(w.fbq, arguments)
            : w.fbq.queue.push(arguments);
        };
        w._fbq         = w.fbq;
        w.fbq.push     = w.fbq;
        w.fbq.loaded   = true;
        w.fbq.version  = '2.0';
        w.fbq.queue    = [];
      }

      // Only load fbevents.js once
      if (!document.querySelector('script[src*="fbevents.js"]')) {
        const fbScript  = document.createElement('script');
        fbScript.async  = true;
        fbScript.src    = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(fbScript);
      }

      _isPixelLoaded  = true;
      w.isPixelLoaded = true;

      // Link this Pixel/Dataset ID if not yet done in this session
      if (!_initializedPixels.has(metaPixelId)) {
        w.fbq('init', metaPixelId);
        _initializedPixels.add(metaPixelId);
        console.log(`[Telemetry] ✅ Meta Pixel linked: ${metaPixelId}`);
      }
    } catch (e) {
      console.error('[Telemetry] ❌ Meta Pixel init error:', e);
    }
  }
};

// ─── Server-Side CAPI Fire ────────────────────────────────────────────────────

interface CAPIUserData {
  email?:          string;
  phone?:          string;
  firstName?:      string;
  lastName?:       string;
  city?:           string;
  country?:        string;
  externalId?:     string;
}

/**
 * Fire a server-side Conversations API event via /api/meta-capi.
 * Runs in the background (non-blocking) — failures are logged but not thrown.
 */
const fireServerEvent = async (
  eventName:  string,
  eventId:    string,
  customData: Record<string, any> = {},
  userData:   CAPIUserData        = {}
): Promise<void> => {
  if (!_capiConfig.pixelId || !_capiConfig.accessToken) return;

  try {
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');

    const payload = {
      pixelId:       _capiConfig.pixelId,
      accessToken:   _capiConfig.accessToken,
      testEventCode: _capiConfig.testEventCode,
      events: [
        {
          eventName,
          eventId,
          eventTime:       Math.floor(Date.now() / 1000),
          eventSourceUrl:  typeof window !== 'undefined' ? window.location.href : '',
          userData: {
            ...userData,
            fbp: fbp || undefined,
            fbc: fbc || undefined,
            clientUserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          },
          customData,
        },
      ],
    };

    // Fire-and-forget — don't await in caller
    fetch('/api/meta-capi', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          console.log(`[Telemetry CAPI] ✅ Server event sent: ${eventName} | fbtrace: ${data.fbtrace_id}`);
        } else {
          console.warn(`[Telemetry CAPI] ⚠️ Server event failed: ${eventName}`, data.error);
        }
      })
      .catch(err => console.error('[Telemetry CAPI] Network error:', err));

  } catch (e) {
    console.error('[Telemetry CAPI] Unexpected error:', e);
  }
};

// ─── Browser Event Fire ───────────────────────────────────────────────────────

/**
 * Check if tracking is blocked for the current landing page (custom per-page control)
 */
const isMarketingBlocked = (): boolean => {
  try {
    const dbBlogs    = useStore.getState().dbBlogs || [];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const activeBlog = dbBlogs.find((b: any) => {
      if (b.id === currentPath) return true;
      const match = currentPath.match(/^\/blog\/([^/]+)$/);
      if (match) return b.id === match[1] || b.id === `/blog/${match[1]}`;
      return false;
    });
    if (activeBlog) {
      const metaMatch = (activeBlog.content || '').match(/^<!-- metadata:\s*({.*?})\s*-->/s);
      if (metaMatch) {
        const meta = JSON.parse(metaMatch[1]);
        if (meta.marketingEnabled === false) return true;
      }
    }
  } catch (_) {}
  return false;
};

/**
 * Core browser event dispatcher — fires to Pixel, GA4, and GTM dataLayer
 */
const fireEvent = (
  eventName:  string,
  eventData:  Record<string, any> = {},
  options:    { eventID?: string; testCode?: string } = {}
): void => {
  if (typeof window === 'undefined') return;
  if (isMarketingBlocked()) {
    console.log(`[Telemetry] 🚫 Blocked for path: ${window.location.pathname}`);
    return;
  }

  const w        = window as any;
  const eventId  = options.eventID;
  const testCode = options.testCode;
  const payload  = { ...eventData };

  // 1. Meta Browser Pixel
  if (w.fbq) {
    const fbOptions: Record<string, any> = {};
    if (eventId)  fbOptions.eventID       = eventId;
    if (testCode) fbOptions.testEventCode = testCode;
    w.fbq('track', eventName, payload, fbOptions);
    console.log(`[Telemetry Pixel] ✅ ${eventName}`, payload, fbOptions);
  }

  // 2. Google Analytics 4
  if (w.gtag) {
    const gaEventName = eventName === 'PageView' ? 'page_view' : eventName;
    w.gtag('event', gaEventName, payload);
    console.log(`[Telemetry GA4] ✅ ${gaEventName}`, payload);
  }

  // 3. Google Tag Manager dataLayer
  if (w.dataLayer) {
    w.dataLayer.push({ event: eventName, eventId, ...payload });
    console.log(`[Telemetry GTM] ✅ dataLayer.push: ${eventName}`, payload);
  }
};

// ─── Public Event Trackers ────────────────────────────────────────────────────

/** PageView — fired on every route change */
export const trackPageView = (
  url:       string,
  eventId:   string,
  testCode?: string
): void => {
  fireEvent('PageView', { page_path: url }, { eventID: eventId, testCode });
  fireServerEvent('PageView', eventId, { page_path: url });
};

/** ViewContent — product detail page visit */
export const trackViewContent = (
  product:   Product,
  eventId:   string,
  testCode?: string
): void => {
  const price = product.discountPrice || product.price;
  const data  = {
    content_name:     product.name,
    content_category: product.category,
    content_ids:      [product.id],
    content_type:     'product',
    value:            price,
    currency:         'BDT',
  };
  fireEvent('ViewContent', data, { eventID: eventId, testCode });
  fireServerEvent('ViewContent', eventId, data);
};

/** AddToCart — adding an item to the shopping cart */
export const trackAddToCart = (
  product:   Product,
  quantity:  number,
  size:      string,
  color:     string,
  eventId:   string,
  testCode?: string
): void => {
  const price = product.discountPrice || product.price;
  const data  = {
    content_name:     product.name,
    content_category: product.category,
    content_ids:      [product.id],
    content_type:     'product',
    value:            price * quantity,
    currency:         'BDT',
    contents:         [{ id: product.id, quantity, item_price: price, size, color }],
  };
  fireEvent('AddToCart', data, { eventID: eventId, testCode });
  fireServerEvent('AddToCart', eventId, data);
};

/** InitiateCheckout — user starts the checkout flow */
export const trackInitiateCheckout = (
  cart:       { product: Product; quantity: number; selectedSize: string; selectedColor: string }[],
  totalValue: number,
  eventId:    string,
  testCode?:  string
): void => {
  const data = {
    content_ids:  cart.map(item => item.product.id),
    content_type: 'product',
    value:        totalValue,
    currency:     'BDT',
    num_items:    cart.reduce((sum, item) => sum + item.quantity, 0),
    contents:     cart.map(item => {
      const price = item.product.discountPrice || item.product.price;
      return { id: item.product.id, quantity: item.quantity, item_price: price, size: item.selectedSize, color: item.selectedColor };
    }),
  };
  fireEvent('InitiateCheckout', data, { eventID: eventId, testCode });
  fireServerEvent('InitiateCheckout', eventId, data);
};

/** Purchase — order submitted successfully */
export const trackPurchase = (
  order:     Order,
  eventId:   string,
  testCode?: string,
  userData?: CAPIUserData
): void => {
  const data = {
    content_ids:    order.items.map(item => item.productId),
    content_type:   'product',
    value:          order.total,
    currency:       'BDT',
    num_items:      order.items.reduce((sum, item) => sum + item.quantity, 0),
    order_id:       order.id,
    payment_method: order.paymentMethod,
    shipping_fee:   order.shippingFee,
    contents:       order.items.map(item => ({
      id:         item.productId,
      quantity:   item.quantity,
      item_price: item.price,
      size:       item.size,
      color:      item.color,
    })),
  };
  fireEvent('Purchase', data, { eventID: eventId, testCode });

  // For Purchase, pass customer PII for CAPI server-side matching (hashed server-side)
  const capiUserData: CAPIUserData = userData || {};
  if (order.phone && !capiUserData.phone) capiUserData.phone = order.phone;

  fireServerEvent('Purchase', eventId, data, capiUserData);
};
