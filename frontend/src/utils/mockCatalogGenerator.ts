import { PRODUCTS } from '../data';
import { Product } from '../types';

const CATEGORIES_POOL = [
  { name: 'Men Fashions', gender: 'Men', baseCost: 650, images: [
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop'
  ]},
  { name: 'Women Fashions', gender: 'Women', baseCost: 850, images: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop'
  ]},
  { name: 'Couple Collection', gender: 'Unisex', baseCost: 1450, images: [
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=600&auto=format&fit=crop'
  ]},
  { name: 'Kids Zone', gender: 'Kids', baseCost: 450, images: [
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=600&auto=format&fit=crop'
  ]},
  { name: 'Watch', gender: 'Men', baseCost: 1250, images: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&auto=format&fit=crop'
  ]},
  { name: 'Gadgets & Electronics', gender: 'Unisex', baseCost: 950, images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop'
  ]}
];

const ITEM_TITLES = [
  'Royal Heritage Premium Panjabi',
  'Exclusive Handloom Cotton Shirt',
  'Pure Organic Salwar Kameez',
  'Luxury Dual Color Couple Festive Set',
  'Classic Executive Analog Chrono Watch',
  'Soft Combed Toddler Sleepwear Set',
  'Minimalist Casual Drop-Shoulder Tee',
  'Festive Silk Weave Traditional Saree',
  'Heavy Cotton Utility Overshirt',
  'Wireless ANC Touch Screen Earbuds',
  'Tailored Slim-Fit Chino Trousers',
  'Waterproof Precision Quartz Watch'
];

/**
 * Generates the full 2,747 realistic catalog of products for offline / simulated mode.
 * Keeps existing 31 manual products as source_id: 'manual'
 * Fills remaining 2,716 items as source_id: 'mohasagor'
 */
export function generateFullSimulatedCatalog(targetTotal = 2747): any[] {
  // 1. Tag initial seed products as manual
  const manualProducts = PRODUCTS.map((p, idx) => ({
    ...p,
    source_id: 'manual',
    sourceId: 'manual',
    source_product_id: null,
    sourceProductId: null,
    purchase_price: (p as any).purchasePrice || (p as any).purchase_price || 0,
    purchasePrice: (p as any).purchasePrice || (p as any).purchase_price || 0
  }));

  const remainingCount = Math.max(0, targetTotal - manualProducts.length);
  const mohasagorProducts: any[] = [];

  for (let i = 1; i <= remainingCount; i++) {
    const cat = CATEGORIES_POOL[i % CATEGORIES_POOL.length];
    const titleBase = ITEM_TITLES[i % ITEM_TITLES.length];
    const sourceProdId = 10000 + i;
    const costVariance = (i * 17) % 300 - 150;
    const cost = Math.max(250, cat.baseCost + costVariance);
    const markupPct = 25 + (i % 4) * 5; // 25%, 30%, 35%, 40%
    const sellingPrice = Math.round(cost * (1 + markupPct / 100));
    const regularPrice = sellingPrice + 200 + ((i * 13) % 400);

    mohasagorProducts.push({
      id: `moh-${sourceProdId}`,
      name: `${titleBase} #${sourceProdId}`,
      slug: `${titleBase.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${sourceProdId}`,
      sku: `MOH-${sourceProdId}`,
      brand: 'Mohasagor Reseller',
      category: cat.name,
      subCategory: 'Reseller Catalog',
      tags: ['Mohasagor', cat.name, 'Wholesale'],
      gender: cat.gender,
      price: regularPrice,
      discountPrice: sellingPrice,
      discount_price: sellingPrice,
      purchase_price: cost,
      purchasePrice: cost,
      reviewsCount: 10 + (i % 80),
      rating: Number((4.0 + ((i % 10) / 10)).toFixed(1)),
      images: cat.images,
      colors: [
        { name: 'Standard', class: 'bg-zinc-800', hex: '#27272a' }
      ],
      sizes: ['M', 'L', 'XL', 'XXL'],
      description: `Premium wholesale catalog product imported from Mohasagor Reseller API. High quality materials, guaranteed color retention and authentic fabric.`,
      stock: 20 + (i % 100),
      lowStockWarning: 5,
      weight: 0.35,
      material: 'Wholesale Standard Blend',
      status: 'published',
      source_id: 'mohasagor',
      sourceId: 'mohasagor',
      source_product_id: String(sourceProdId),
      sourceProductId: String(sourceProdId),
      isFeatured: i % 25 === 0,
      isTrending: i % 15 === 0,
      isNew: i % 10 === 0,
      isBestSeller: i % 20 === 0,
      isFlashSale: i % 30 === 0
    });
  }

  return [...manualProducts, ...mohasagorProducts];
}
