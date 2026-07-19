/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Review, BlogPost } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'overshirt-012',
    name: "UrbanFlex Men's Premium Cotton Overshirt",
    category: 'Men Fashions',
    brand: 'No Brand',
    gender: 'Men',
    price: 670,
    discountPrice: 544,
    rating: 4.2,
    reviewsCount: 65,
    images: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Slate Gray', class: 'bg-gray-600', hex: '#4B5563' }
    ],
    sizes: ['M', 'L', 'XL'],
    description: 'Perfect for transitional seasonal weather. Made from 100% thick structured cotton fabric. Styled with double buttoned flap utility breast pockets, structured point collar, and heavy contrast stitching.',
    features: [
      '100% Heavyweight structured premium cotton weave',
      'Dual utility button-flap breast storage pockets',
      'Durable resin horn design premium buttons',
      'Adjustable buttoned cuffs for personalized wrist fits'
    ],
    stock: 40,
    isNew: true
  },
  {
    id: 'watch-005',
    name: 'SteelMark Classic Black Dial Watch',
    category: 'Accessories',
    brand: 'No Brand',
    gender: 'Men',
    price: 2450,
    discountPrice: 1990,
    rating: 4.0,
    reviewsCount: 74,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Classic Silver', class: 'bg-slate-300', hex: '#CBD5E1' }
    ],
    sizes: ['Adjustable'],
    description: 'Form meets timeless precision. Features a sharp deep-black dial, housed under protective mineral glass, set within a durable stainless steel casing.',
    features: [
      'Polished high-grade Stainless Steel links & case',
      'Scratch-resistant sapphire mineral crystal glass',
      'Ultra-precise Quartz Japanese caliber movement'
    ],
    stock: 18,
    isFlashSale: true,
    isBestSeller: true
  },
  {
    id: 'band-006',
    name: 'FlexCore Home Resistance Bands Set',
    category: 'Fitness',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 1250,
    discountPrice: 990,
    rating: 3.5,
    reviewsCount: 52,
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Multi Color', class: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500', hex: '#ef4444' }
    ],
    sizes: ['11-Piece Set'],
    description: 'Transform your home workout with the FlexCore 11-Piece Resistance Bands Set. Made of natural, high-strength latex elastic ropes.',
    features: [
      '100% Eco-friendly high-strength natural latex tubes',
      'Up to 150 lbs stackable workout tension limits'
    ],
    stock: 32,
    isFlashSale: true
  },
  {
    id: 'lamp-001',
    name: 'SereneGlow Ceramic Table Lamp',
    category: 'Accessories',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 2250,
    discountPrice: 1890,
    rating: 4.5,
    reviewsCount: 38,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Warm White', class: 'bg-amber-100', hex: '#FEF3C7' },
      { name: 'Ceramic Gray', class: 'bg-gray-300', hex: '#D1D5DB' }
    ],
    sizes: ['Standard'],
    description: 'Elevate your living space with the SereneGlow Ceramic Table Lamp. This beautiful table lamp features a hand-glazed ceramic base.',
    features: [
      'Hand-glazed ceramic textured base',
      'Premium woven linen drum shade'
    ],
    stock: 25,
    isNew: true,
    isFlashSale: true,
    isBestSeller: true
  },
  {
    id: 'kurti-002',
    name: "LunaBloom Women's Printed Georgette Kurti",
    category: 'Women Fashions',
    brand: 'No Brand',
    gender: 'Women',
    price: 1450,
    discountPrice: 1190,
    rating: 4.6,
    reviewsCount: 42,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Blossom Pink', class: 'bg-rose-200', hex: '#FECDD3' },
      { name: 'Lavender Mist', class: 'bg-purple-100', hex: '#F3E8FF' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: "LunaBloom Kurti features elegant traditional handprinted floral motifs on soft premium georgette fabric.",
    features: [
      'Premium lightweight breathable Georgette fabric',
      'Detailed floral prints with minor golden embroidery trim'
    ],
    stock: 15,
    isNew: true,
    isFlashSale: true,
    isBestSeller: true
  },
  {
    id: 'power-003',
    name: 'Hoco J154a 22.5w 20000mah Powerbank',
    category: 'Electronics',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 2100,
    discountPrice: 2000,
    rating: 3.0,
    reviewsCount: 88,
    images: [
      'https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Slate Black', class: 'bg-zinc-800', hex: '#27272A' },
      { name: 'Arctic White', class: 'bg-slate-100 border border-gray-200', hex: '#F1F5F9' }
    ],
    sizes: ['20000mAh'],
    description: 'Equipped with ultra-fast 22.5W Power Delivery (PD) and Quick Charge 3.0 technologies.',
    features: [
      'High-density 20,000mAh Lithium-Polymer cell capacity',
      '22.5W Bidirectional Super Fast Charge technology'
    ],
    stock: 45,
    isFlashSale: true,
    isBestSeller: true
  },
  {
    id: 'toy-008',
    name: 'Toy Construction Truck / Toy Beko for kids',
    category: 'Baby & Kids',
    brand: 'No Brand',
    gender: 'Kids',
    price: 450,
    discountPrice: 350,
    rating: 3.5,
    reviewsCount: 92,
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Yellow', class: 'bg-yellow-500', hex: '#eab308' }
    ],
    sizes: ['Small'],
    description: 'Fuel your childs imagination with this realistic yellow Toy Excavator Construction Truck.',
    features: [
      'Friction-powered wheels - no batteries required',
      'Articulated, 360-degree rotating excavation digger arm'
    ],
    stock: 50,
    isFeatured: true,
    isNew: true
  },
  {
    id: 'shoes-013',
    name: 'HUSH PUPPIES LOGAN MENS HP CLOSED',
    category: 'Men Fashions',
    brand: 'Apex',
    gender: 'Men',
    price: 2400,
    discountPrice: 1900,
    rating: 4.4,
    reviewsCount: 36,
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Onyx Black', class: 'bg-neutral-900', hex: '#111827' }
    ],
    sizes: ['40', '41', '42', '43'],
    description: 'Logan shoe is handcrafted using ultra-soft full grain sheepskin leather, detailed with flexible comfort outsoles.',
    features: [
      '100% Premium full grain soft genuine leather',
      'Cushioned memory foam inner comfort footbed'
    ],
    stock: 12,
    isNew: true
  },
  {
    id: 'cooker-009',
    name: 'Electric Panci Non-stick Mini Rice Cooker 1.8 L',
    category: 'Electronics',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 1900,
    discountPrice: 1700,
    rating: 4.3,
    reviewsCount: 61,
    images: [
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Soft Green', class: 'bg-emerald-100', hex: '#D1FAE5' },
      { name: 'Pale Pink', class: 'bg-rose-100', hex: '#FFE4E6' }
    ],
    sizes: ['1.8L'],
    description: 'Perfect for bachelors, students, and small families. Steam, boil, or fry with ease.',
    features: [
      'Food-grade Teflon premium non-stick inner lining coating',
      'Dual adjustable heating modes'
    ],
    stock: 14,
    isFeatured: true
  },
  {
    id: 'clock-010',
    name: 'Octagon Shaped Metal Twin Bell Alarm Clock',
    category: 'Accessories',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 900,
    discountPrice: 750,
    rating: 3.0,
    reviewsCount: 145,
    images: [
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Classic Yellow', class: 'bg-yellow-400', hex: '#FACC15' },
      { name: 'Turquoise Blue', class: 'bg-sky-400', hex: '#38BDF8' }
    ],
    sizes: ['Standard'],
    description: 'Retro octagon-shaped twin bell alarm clock with super-loud alarms and night backlight.',
    features: [
      'Mechanical hammer and real metal dual bells strike sound',
      'Super-quiet quartz sweeping hands mechanism'
    ],
    stock: 25,
    isFeatured: true,
    isNew: true
  },
  {
    id: 'oil-014',
    name: 'Axe Brand Universal Oil 100ml',
    category: 'Health Care',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 650,
    discountPrice: 550,
    rating: 4.7,
    reviewsCount: 94,
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Clear', class: 'bg-white border', hex: '#ffffff' }
    ],
    sizes: ['100ml'],
    description: 'A handy remedy for every home. Pure in color, pleasant in odor, and effective for quick pain relief.',
    features: [
      'Quick relief for headaches, insect bites, and joint aches',
      'Pleasant herbal menthol and eucalyptus aroma'
    ],
    stock: 150
  },
  {
    id: 'dumb-015',
    name: '5 kg hex dumbbell black ,stainless steel',
    category: 'Fitness',
    brand: 'Sports Vision',
    gender: 'Accessories',
    price: 3500,
    discountPrice: 3000,
    rating: 4.8,
    reviewsCount: 51,
    images: [
      'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Steel Black', class: 'bg-zinc-800', hex: '#27272A' }
    ],
    sizes: ['5kg Single'],
    description: 'Hexagonal dumbbells made from robust cast iron and rubber-coated weights for home exercises.',
    features: [
      'Ergonomically contoured solid stainless steel handles',
      'Hexagonal design weights prevent dumbbell rolling'
    ],
    stock: 20
  },
  {
    id: 'walkie-016',
    name: 'Walkie Talkie Toy For Kids Play Toys',
    category: 'Baby & Kids',
    brand: 'No Brand',
    gender: 'Kids',
    price: 850,
    discountPrice: 699,
    rating: 3.0,
    reviewsCount: 33,
    images: [
      'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Camo Green', class: 'bg-green-800', hex: '#166534' }
    ],
    sizes: ['2-Pack'],
    description: 'Keep your kids active! Colorful rings, stacking blocks, and tiny walker gadgets to inspire toddler minds.',
    features: [
      'Simple, easy-to-use mechanical block builds',
      'Child-safe non-toxic wood and rubber parts'
    ],
    stock: 28,
    isNew: true
  },
  {
    id: 'watch-011',
    name: "Curren 8301 Men's Watch – Stylish Durable",
    category: 'Accessories',
    brand: 'No Brand',
    gender: 'Men',
    price: 2800,
    discountPrice: 2500,
    rating: 4.0,
    reviewsCount: 167,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Bronze Leather', class: 'bg-amber-800', hex: '#92400E' }
    ],
    sizes: ['Standard'],
    description: 'A premium designer watch for men with a robust casing and comfortable genuine brown leather strap.',
    features: [
      'High-quality genuine calfskin leather strap',
      'Accurate Japanese quartz movement'
    ],
    stock: 22,
    isFeatured: true
  },
  {
    id: 'shalwar-017',
    name: 'Sufiya Nazim Georgette Shalwar Kameez',
    category: 'Women Fashions',
    brand: 'No Brand',
    gender: 'Women',
    price: 1800,
    discountPrice: 1450,
    rating: 5.0,
    reviewsCount: 47,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Emerald Green', class: 'bg-teal-900', hex: '#042f2e' }
    ],
    sizes: ['M', 'L', 'XL'],
    description: 'Designer Shalwar Kameez set hand-detailed with shimmering embroidery, includes a soft dupatta and cotton pants.',
    features: [
      'Complete 3-Piece traditional outfit package set',
      'Premium breathable lightweight georgette base'
    ],
    stock: 10,
    isNew: true
  },
  {
    id: 'tshirt-004',
    name: 'Half Sleeve Jersey T-Shirt For Men',
    category: 'Men Fashions',
    brand: 'No Brand',
    gender: 'Men',
    price: 650,
    discountPrice: 550,
    rating: 4.5,
    reviewsCount: 110,
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Onyx Black', class: 'bg-black', hex: '#000000' }
    ],
    sizes: ['M', 'L', 'XL'],
    description: 'Knit from high-thread cotton-jersey blend providing supreme stretch and breathability.',
    features: [
      '180 GSM Combed Jersey Cotton blend',
      'Active-stretch panels that flex comfortably'
    ],
    stock: 120,
    isFlashSale: true,
    isBestSeller: true
  },
  {
    id: 'serum-018',
    name: 'Ruposhi Anti-Aging Repair Liquid',
    category: 'Health Care',
    brand: 'Ruposhi',
    gender: 'Women',
    price: 1600,
    discountPrice: 1400,
    rating: 2.5,
    reviewsCount: 39,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Clear Gold', class: 'bg-yellow-50', hex: '#fffbeb' }
    ],
    sizes: ['50ml'],
    description: 'Repairs deep skin moisture matrices, reduces wrinkles, and evens out skin textures with daily evening applications.',
    features: [
      'Infused with Hyaluronic Acid and natural collagen',
      'Extremely lightweight, quick-absorption oil-free formula'
    ],
    stock: 35,
    isNew: true
  },
  {
    id: 'dates-007',
    name: 'Organic Fresh Kalmi Dates (Kheur)',
    category: 'Grocery',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 500,
    discountPrice: 400,
    rating: 2.5,
    reviewsCount: 125,
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Natural Brown', class: 'bg-amber-950', hex: '#451a03' }
    ],
    sizes: ['500g', '1kg'],
    description: 'Naturally sweet and rich. Sourced from organic, ethically-managed orchards in Medina.',
    features: [
      '100% Naturally sun-dried Organic Kalmi dates',
      'No added preservatives or artificial sweeteners'
    ],
    stock: 200,
    isFeatured: true,
    isNew: true
  },
  {
    id: 'mustard-019',
    name: 'Foodela Organic Mustard Oil',
    category: 'Grocery',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 200,
    discountPrice: 200,
    rating: 3.0,
    reviewsCount: 15,
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Natural Gold', class: 'bg-yellow-600', hex: '#ca8a04' }
    ],
    sizes: ['500ml', '1L'],
    description: 'Cold-pressed from premium quality mustard seeds. Known for its strong aroma and authentic sharp pungent taste.',
    features: [
      '100% Cold-pressed organic mustard oil',
      'Rich in natural antioxidants and sharp flavor'
    ],
    stock: 80
  },
  {
    id: 'honey-020',
    name: 'Alshifa Organic Black Forest Honey',
    category: 'Grocery',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 1200,
    discountPrice: 1200,
    rating: 0,
    reviewsCount: 0,
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Dark Honey', class: 'bg-amber-900', hex: '#78350f' }
    ],
    sizes: ['500g'],
    description: 'Dark, raw honey sourced from deep European forests. possesses a rich, woody, and intensely sweet profile.',
    features: [
      '100% Pure imported European Black Forest Honey',
      'Unfiltered, raw, and unpasteurized quality'
    ],
    stock: 45
  },
  // Extra items to perfectly fulfill counts
  {
    id: 'rice-021',
    name: 'Premium Chinigura Rice (Aromatic)',
    category: 'Grocery',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 180,
    discountPrice: 160,
    rating: 4.5,
    reviewsCount: 45,
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [{ name: 'White', class: 'bg-white border', hex: '#fff' }],
    sizes: ['1kg', '5kg'],
    description: 'Premium aromatic Chinigura rice harvested in Bangladesh, clean, sorted, and sweet-scented.',
    features: ['High-yield premium grain', 'Sweet traditional scent'],
    stock: 150
  },
  {
    id: 'tea-022',
    name: 'Organic Green Tea Leaves',
    category: 'Grocery',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 350,
    discountPrice: 300,
    rating: 4.4,
    reviewsCount: 30,
    images: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [{ name: 'Green', class: 'bg-green-100', hex: '#bbf7d0' }],
    sizes: ['100g'],
    description: 'Hand-picked tea leaves from the estates of Sylhet, rich in fresh organic antioxidants.',
    features: ['100% natural green tea leaves', 'Rich, calming herbal taste'],
    stock: 95
  },
  {
    id: 'blocks-023',
    name: 'Classic Wooden Stacking Blocks Toy',
    category: 'Baby & Kids',
    brand: 'No Brand',
    gender: 'Kids',
    price: 790,
    discountPrice: 650,
    rating: 4.8,
    reviewsCount: 22,
    images: [
      'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [{ name: 'Multi', class: 'bg-gradient-to-r from-red-400 to-blue-400', hex: '#f00' }],
    sizes: ['Standard'],
    description: 'Inspires toddler balance, visual coordination, and motor skills with colored wooden elements.',
    features: ['Eco-friendly material', 'Smooth safe round edges'],
    stock: 12
  },
  {
    id: 'romper-024',
    name: 'Soft Cotton Romper Set for Babies',
    category: 'Baby & Kids',
    brand: 'No Brand',
    gender: 'Kids',
    price: 850,
    discountPrice: 720,
    rating: 4.6,
    reviewsCount: 18,
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [{ name: 'Sky Blue', class: 'bg-sky-100', hex: '#e0f2fe' }],
    sizes: ['0-3M', '3-6M', '6-12M'],
    description: 'Knitted with soft, premium organic cotton fabrics ensuring skin protection and safety.',
    features: ['100% Organic breathable cotton', 'Easy snap-button diaper replacement closures'],
    stock: 15
  },
  {
    id: 'saree-025',
    name: 'Empress Royal Silk Festivity Saree',
    category: 'Women Fashions',
    brand: 'No Brand',
    gender: 'Women',
    price: 5200,
    discountPrice: 4800,
    rating: 4.9,
    reviewsCount: 33,
    images: [
      'https://images.unsplash.com/photo-1610030472661-bc012dfec893?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [{ name: 'Royal Crimson', class: 'bg-rose-900', hex: '#881337' }],
    sizes: ['Free Size'],
    description: 'Stunning premium silk festival Saree with beautiful handprinted patterns and matching blouse fabric.',
    features: ['Shimmering premium fabric', 'Traditional elegance and embroidery design'],
    stock: 8
  },
  {
    id: 'tops-026',
    name: 'Lace Detailed Linen Top for Women',
    category: 'Women Fashions',
    brand: 'No Brand',
    gender: 'Women',
    price: 1200,
    discountPrice: 950,
    rating: 4.4,
    reviewsCount: 25,
    images: [
      'https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [{ name: 'Cream White', class: 'bg-amber-50', hex: '#fffbef' }],
    sizes: ['S', 'M', 'L'],
    description: 'Comfortable casual linen top detailed with subtle lace details and relaxed regular fitting.',
    features: ['100% organic soft linen weave', 'Elegant daily style versatility'],
    stock: 30
  },
  {
    id: 'panjabi-027',
    name: 'Royal Heritage Jacquard Panjabi',
    category: 'Men Fashions',
    brand: 'No Brand',
    gender: 'Men',
    price: 2850,
    discountPrice: 2550,
    rating: 4.9,
    reviewsCount: 81,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [{ name: 'Royal Blue', class: 'bg-blue-900', hex: '#1e3a8a' }],
    sizes: ['38', '40', '42', '44'],
    description: 'Woven with high-density premium jacquard structures, featuring detailed hand-stitch buttons.',
    features: ['Jacquard premium self-weaving', 'Mandarin designer collar trims'],
    stock: 14
  },
  {
    id: 'mat-028',
    name: 'Premium High-Density TPE Yoga Mat',
    category: 'Fitness',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 1450,
    discountPrice: 1200,
    rating: 4.7,
    reviewsCount: 34,
    images: [
      'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [{ name: 'Ocean Blue', class: 'bg-sky-700', hex: '#0369a1' }],
    sizes: ['6mm'],
    description: 'Eco-friendly double-sided non-slip surface, provides maximum support for joint cushion protections.',
    features: ['6mm premium joint protection', 'Highly sweat-resistant grip surface'],
    stock: 25
  },
  {
    id: 'grip-029',
    name: 'Heavy-duty Grip Strengthener Trainer',
    category: 'Fitness',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 450,
    discountPrice: 350,
    rating: 4.5,
    reviewsCount: 61,
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [{ name: 'Silver Steel', class: 'bg-gray-400', hex: '#9ca3af' }],
    sizes: ['Adjustable 10-60kg'],
    description: 'Adjustable mechanical resistance settings, perfect for hand, wrist, and forearm exercises.',
    features: ['High-tension carbon steel spring', 'Comfortable textured rubber handles'],
    stock: 40
  },
  {
    id: 'speaker-030',
    name: 'AcousticBoost Portable Wireless Speaker',
    category: 'Electronics',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 1250,
    discountPrice: 1100,
    rating: 4.4,
    reviewsCount: 78,
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [{ name: 'Forest Teal', class: 'bg-teal-700', hex: '#0f766e' }],
    sizes: ['Standard'],
    description: 'Splashproof wireless bluetooth speaker delivering powerful immersive stereo acoustic outputs.',
    features: ['IPX5 Waterproof splash rating protection', '12-Hour continuous play rechargeable battery'],
    stock: 18
  },
  {
    id: 'mask-031',
    name: 'KNS95 Reusable Filtration Face Mask',
    category: 'Health Care',
    brand: 'No Brand',
    gender: 'Accessories',
    price: 350,
    discountPrice: 280,
    rating: 4.5,
    reviewsCount: 112,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'
    ],
    colors: [{ name: 'Onyx Black', class: 'bg-zinc-800', hex: '#27272a' }],
    sizes: ['M', 'L'],
    description: 'Highly breathable protective masks with activated carbon layer and adjustable dual strap fits.',
    features: ['5-Layer high filtration efficiency', 'Washable and reusable soft fabrics'],
    stock: 500
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-001',
    userName: 'Kazi Nafis',
    rating: 5,
    comment: 'The SereneGlow table lamp looks absolutely stunning in my bedroom. The warm glow is extremely soothing, exactly what I was searching for! Delivered inside Dhaka within 24 hours. Recommended!',
    date: '2026-06-28',
    verified: true,
    userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop'
  },
  {
    id: 'rev-002',
    userName: 'Samia Rahman',
    rating: 5,
    comment: 'Kurti fits perfectly! The georgette material is highly breathable and cool, and the pink floral print is so elegant. Payment with bKash was instant and delivery was very quick!',
    date: '2026-06-15',
    verified: true,
    userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop'
  }
];

export const BLOGS: BlogPost[] = [
  {
    id: 'blog-001',
    title: 'BEST GIFT IDEAS FOR FRIENDS AND FAMILY',
    excerpt: 'Choosing the perfect gift for friends and family can sometimes feel difficult. You want to give something useful, thoughtful, and high-quality.',
    content: 'Whether it is a beautiful modern ceramic table lamp for their bedside, a high-precision metal watch, or a premium fragrance, the best gifts are always those that merge high everyday utility with premium design. Shop Mart helps you pick the right aesthetic fits that convey your deep warmth and care without breaking the bank.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop',
    date: 'June 6, 2026',
    readTime: 'No Comments'
  },
  {
    id: 'blog-002',
    title: 'HOW TO TRACK YOUR ONLINE ORDER EASILY',
    excerpt: 'Online shopping is simple, fast, and convenient. After placing an order, one of the most common questions customers have is tracking progress.',
    content: 'Knowing exactly where your parcel is provides peace of mind. Shop Mart features a real-time instant Order Tracking system where you simply input your Order ID (such as MART-9524) and billing phone number to see if your package is confirmed, packed, shipped or near your doorstep.',
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=600&auto=format&fit=crop',
    date: 'June 6, 2026',
    readTime: 'No Comments'
  },
  {
    id: 'blog-003',
    title: 'HOW TO SAVE MONEY WHILE SHOPPING ONLINE',
    excerpt: 'Online shopping has become one of the easiest and most convenient ways to buy products. From fashion and tech to home goods and daily groceries.',
    content: 'Saving money is an art. To shop smart, look out for our 24/5 Flash Sales where items are discounted up to 21% flat, subscribe to our VIP newsletters to grab early bird coupons, and buy bundled combos such as couple matching apparel sets to get luxury styling at half the street price.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
    date: 'June 6, 2026',
    readTime: 'No Comments'
  }
];

export const FAQ = [
  {
    q: 'Do you offer Cash on Delivery (COD) across Bangladesh?',
    a: 'Yes, absolutely! We offer nationwide Cash on Delivery. You can pay the delivery agent in cash only after receiving and verifying the package. We deliver to all sub-districts (Upazila) and villages across Bangladesh.'
  },
  {
    q: 'What are your delivery charges and shipping times?',
    a: 'Our delivery fee is Flat BDT 60 inside Dhaka and BDT 120 anywhere else in Bangladesh. Delivery inside Dhaka takes 1 to 2 working days. Outside Dhaka takes 2 to 4 working days.'
  },
  {
    q: 'What is your exchange and return policy?',
    a: 'We offer a hassle-free 7-day Exchange Policy if the size does not fit or if there is any material defect. Simply keep the tags intact and do not wash the garment. Contact our customer care over phone, and we will schedule an exchange pickup at your doorstep.'
  },
  {
    q: 'Are your products 100% authentic?',
    a: 'Yes, Rupan is an official registered brand. We guarantee 100% authenticity and fresh quality on every single purchase.'
  }
];
