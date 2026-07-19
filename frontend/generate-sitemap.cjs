const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Try to load Supabase keys from various local .env files
function loadEnvKeys() {
  const envPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', 'admin', '.env'),
  ];

  let url = process.env.VITE_SUPABASE_URL;
  let key = process.env.VITE_SUPABASE_ANON_KEY;

  for (const p of envPaths) {
    if (url && key) break;
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const matchUrl = line.match(/^\s*VITE_SUPABASE_URL\s*=\s*["']?([^"'\s]+)["']?/);
        const matchKey = line.match(/^\s*VITE_SUPABASE_ANON_KEY\s*=\s*["']?([^"'\s]+)["']?/);
        if (matchUrl) url = matchUrl[1];
        if (matchKey) key = matchKey[1];
      }
    }
  }

  return { url, key };
}

async function run() {
  console.log('--- Generating Dynamic Storefront SEO Sitemap ---');
  
  const { url: supabaseUrl, key: supabaseAnonKey } = loadEnvKeys();
  const baseUrl = 'https://www.myrupan.com';
  
  let products = [];
  let blogs = [];
  let categories = ['men', 'women', 'kids', 'accessories'];

  const hasRealKeys = supabaseUrl && supabaseAnonKey && 
                      !supabaseUrl.includes('YOUR') && 
                      supabaseUrl.trim() !== '';

  if (hasRealKeys) {
    try {
      console.log(`Connecting to Supabase at: ${supabaseUrl}`);
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Fetch ALL products with range pagination
      let dbProducts = [];
      let pPage = 0;
      let hasMoreProducts = true;
      while (hasMoreProducts) {
        const { data: pData, error: pErr } = await supabase
          .from('products')
          .select('id, name, category, status')
          .range(pPage * 1000, (pPage + 1) * 1000 - 1);

        if (pErr || !pData || pData.length === 0) {
          hasMoreProducts = false;
        } else {
          dbProducts = dbProducts.concat(pData);
          if (pData.length < 1000) hasMoreProducts = false;
          else pPage++;
        }
      }
      if (dbProducts.length > 0) {
        products = dbProducts;
        console.log(`Loaded ${products.length} products from Supabase for sitemap.`);
      }

      // Fetch ALL blogs with range pagination
      let dbBlogs = [];
      let bPage = 0;
      let hasMoreBlogs = true;
      while (hasMoreBlogs) {
        const { data: bData, error: bErr } = await supabase
          .from('blogs')
          .select('id, status')
          .range(bPage * 1000, (bPage + 1) * 1000 - 1);

        if (bErr || !bData || bData.length === 0) {
          hasMoreBlogs = false;
        } else {
          dbBlogs = dbBlogs.concat(bData);
          if (bData.length < 1000) hasMoreBlogs = false;
          else bPage++;
        }
      }
      if (dbBlogs.length > 0) {
        blogs = dbBlogs.filter(b => b.status === 'published');
        console.log(`Loaded ${blogs.length} published blogs from Supabase for sitemap.`);
      }

    } catch (err) {
      console.error('Failed to query Supabase for sitemap:', err.message);
    }
  } else {
    console.log('No Supabase credentials found in environment. Generating fallback static sitemap...');
    // Fallback static items
    products = [
      { id: 'mohasagor-4083', name: "Men's Ban Collar Cotton Shirt-", status: 'published' },
      { id: 'mohasagor-4172', name: '(Wallet ফ্রি) shoulder bag With Lock - Black', status: 'published' }
    ];
    blogs = [
      { id: 'seo-tips-ecomm' }
    ];
  }

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Helper to add URL node
  const addUrlNode = (path, priority = '0.5', changefreq = 'weekly') => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${path}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += '  </url>\n';
  };

  // Add Static Core Routes
  addUrlNode('/', '1.0', 'daily');
  addUrlNode('/shop', '0.9', 'daily');
  addUrlNode('/cart', '0.6', 'monthly');
  addUrlNode('/checkout', '0.5', 'monthly');
  addUrlNode('/track-order', '0.6', 'monthly');
  addUrlNode('/wishlist', '0.5', 'monthly');
  addUrlNode('/about-us', '0.4', 'monthly');
  addUrlNode('/contact-us', '0.4', 'monthly');
  addUrlNode('/offers', '0.7', 'daily');
  addUrlNode('/new-arrivals', '0.8', 'daily');
  addUrlNode('/blog', '0.7', 'daily');

  // Add Dynamic Categories
  const uniqueCategories = new Set(categories);
  products.forEach(p => {
    if (p.category) {
      const cleanCat = p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      uniqueCategories.add(cleanCat);
    }
  });

  uniqueCategories.forEach(cat => {
    addUrlNode(`/shop?category=${encodeURIComponent(cat)}`, '0.6', 'weekly');
  });

  // Add Dynamic Product URLs (using the new SEO-friendly format with numeric ID)
  // Format: name-slug-numericId
  products.forEach(p => {
    if (p.status === 'draft' || p.status === 'archived') return;
    
    // Extract trailing number from product ID
    const numMatch = String(p.id).match(/\d+$/);
    const numericId = numMatch ? numMatch[0] : '';
    
    if (numericId) {
      const nameSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const slug = `${nameSlug}-${numericId}`;
      addUrlNode(`/product/${slug}`, '0.8', 'weekly');
    } else {
      addUrlNode(`/product/${p.id}`, '0.7', 'weekly');
    }
  });

  // Add Dynamic Blog URLs
  blogs.forEach(b => {
    addUrlNode(`/blog/${b.id}`, '0.6', 'weekly');
  });

  xml += '</urlset>\n';

  // Ensure public directory exists
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write Sitemap XML file
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  
  console.log(`Successfully generated sitemap: ${sitemapPath}`);
}

run();
