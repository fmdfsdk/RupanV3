/**
 * Telemetry and Marketing Ad Integrations (Meta Pixel, GTM, GA4)
 * Dynamically loaded from Supabase settings table.
 */

import { Product, Order } from '../types';

let isPixelLoaded = false;
let isGTMConfigured = false;
let isGAConfigured = false;

interface TelemetryConfig {
  metaPixelId?: string;
  metaTestEventCode?: string;
  googleTagManagerId?: string;
  googleAnalyticsId?: string;
}

// Generate a unique Event ID for deduplication (CAPI & Pixel matching)
export const generateEventId = (eventName: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `evt-${eventName.toLowerCase()}-${timestamp}-${random}`;
};

/**
 * Initialize and inject tracking scripts into <head> at runtime based on DB settings
 */
export const initializeTelemetry = (config: TelemetryConfig) => {
  if (typeof window === 'undefined') return;

  const { metaPixelId, metaTestEventCode, googleTagManagerId, googleAnalyticsId } = config;

  // 1. Google Tag Manager
  if (googleTagManagerId && !isGTMConfigured) {
    try {
      // Script tag
      const gtmScript = document.createElement('script');
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${googleTagManagerId}');
      `;
      document.head.appendChild(gtmScript);

      // Noscript iframe (fallback)
      const gtmNoscript = document.createElement('noscript');
      gtmNoscript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `;
      document.body.insertBefore(gtmNoscript, document.body.firstChild);
      isGTMConfigured = true;
      console.log(`[Telemetry] Google Tag Manager initialized: ${googleTagManagerId}`);
    } catch (e) {
      console.error('[Telemetry] Error loading GTM:', e);
    }
  }

  // 2. Google Analytics 4 (GA4)
  if (googleAnalyticsId && !isGAConfigured) {
    try {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
      document.head.appendChild(gaScript);

      const gaConfigScript = document.createElement('script');
      gaConfigScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${googleAnalyticsId}', { 'send_page_view': false });
      `;
      document.head.appendChild(gaConfigScript);
      isGAConfigured = true;
      console.log(`[Telemetry] Google Analytics initialized: ${googleAnalyticsId}`);
    } catch (e) {
      console.error('[Telemetry] Error loading GA4:', e);
    }
  }

  // 3. Meta (Facebook) Pixel
  if (metaPixelId && !isPixelLoaded) {
    try {
      const fbScript = document.createElement('script');
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
      `;
      document.head.appendChild(fbScript);

      // Initialize pixel
      (window as any).fbq = (window as any).fbq || function() {
        ((window as any).fbq as any).queue.push(arguments);
      };
      (window as any).fbq('init', metaPixelId);
      isPixelLoaded = true;
      console.log(`[Telemetry] Meta Pixel initialized: ${metaPixelId}`);
    } catch (e) {
      console.error('[Telemetry] Error loading Meta Pixel:', e);
    }
  }
};

/**
 * Helper to execute tracking triggers safely
 */
const fireEvent = (
  eventName: string,
  eventData: Record<string, any> = {},
  options: { eventID?: string; testCode?: string } = {}
) => {
  if (typeof window === 'undefined') return;

  const w = window as any;
  const eventId = options.eventID;
  const testCode = options.testCode;

  // Compile payload with test event code if present
  const payload = { ...eventData };
  if (testCode) {
    payload.test_event_code = testCode;
  }

  // 1. Meta Pixel trigger
  if (isPixelLoaded && w.fbq) {
    const fbOptions = eventId ? { eventID: eventId } : {};
    w.fbq('track', eventName, payload, fbOptions);
    console.log(`[Telemetry] Fired Meta Pixel: ${eventName}`, payload, fbOptions);
  }

  // 2. Google Analytics page view/custom event trigger
  if (isGAConfigured && w.gtag) {
    w.gtag('event', eventName, payload);
    console.log(`[Telemetry] Fired GA4 Event: ${eventName}`, payload);
  }

  // 3. Google Tag Manager Custom Events trigger
  if (isGTMConfigured && w.dataLayer) {
    w.dataLayer.push({
      event: eventName,
      eventId: eventId,
      ...payload
    });
    console.log(`[Telemetry] Fired GTM DataLayer: ${eventName}`, payload);
  }
};

/**
 * Event: PageView
 */
export const trackPageView = (url: string, eventId: string, testCode?: string) => {
  fireEvent('PageView', { page_path: url }, { eventID: eventId, testCode });
};

/**
 * Event: ViewContent (Viewing product detail page)
 */
export const trackViewContent = (product: Product, eventId: string, testCode?: string) => {
  const price = product.discountPrice || product.price;
  fireEvent('ViewContent', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    content_type: 'product',
    value: price,
    currency: 'BDT'
  }, { eventID: eventId, testCode });
};

/**
 * Event: AddToCart (Adding an item to the shopping cart)
 */
export const trackAddToCart = (
  product: Product,
  quantity: number,
  size: string,
  color: string,
  eventId: string,
  testCode?: string
) => {
  const price = product.discountPrice || product.price;
  fireEvent('AddToCart', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    content_type: 'product',
    value: price * quantity,
    currency: 'BDT',
    contents: [
      {
        id: product.id,
        quantity: quantity,
        item_price: price,
        size: size,
        color: color
      }
    ]
  }, { eventID: eventId, testCode });
};

/**
 * Event: InitiateCheckout (Clicking checkout to start order form)
 */
export const trackInitiateCheckout = (
  cart: { product: Product; quantity: number; selectedSize: string; selectedColor: string }[],
  totalValue: number,
  eventId: string,
  testCode?: string
) => {
  fireEvent('InitiateCheckout', {
    content_ids: cart.map(item => item.product.id),
    content_type: 'product',
    value: totalValue,
    currency: 'BDT',
    num_items: cart.reduce((sum, item) => sum + item.quantity, 0),
    contents: cart.map(item => {
      const price = item.product.discountPrice || item.product.price;
      return {
        id: item.product.id,
        quantity: item.quantity,
        item_price: price,
        size: item.selectedSize,
        color: item.selectedColor
      };
    })
  }, { eventID: eventId, testCode });
};

/**
 * Event: Purchase (Order submitted successfully)
 */
export const trackPurchase = (order: Order, eventId: string, testCode?: string) => {
  fireEvent('Purchase', {
    content_ids: order.items.map(item => item.productId),
    content_type: 'product',
    value: order.total,
    currency: 'BDT',
    num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
    order_id: order.id,
    payment_method: order.paymentMethod,
    shipping_fee: order.shippingFee,
    contents: order.items.map(item => ({
      id: item.productId,
      quantity: item.quantity,
      item_price: item.price,
      size: item.size,
      color: item.color
    }))
  }, { eventID: eventId, testCode });
};
