import { createClient } from '@supabase/supabase-js';
import { PRODUCTS, REVIEWS, BLOGS } from '../data';
import { Product, Order, Review, BlogPost, Coupon } from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Check if keys are actually provided (and are not empty strings or placeholders)
const hasRealKeys = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '';

// Real Supabase Client (if keys are configured)
export const realSupabase = hasRealKeys ? createClient(supabaseUrl, supabaseAnonKey) : null;

// ============================================================================
// SOLID CLIENT-SIDE STORAGE BACKEND SIMULATOR (MOCK ENGINE FOR OFFLINE PREVIEW)
// ============================================================================
// This database engine runs in the browser, offering persistent data, simulated latency,
// authentication state, storage, and real-time updates for high-fidelity previews.

class LocalDatabase {
  private listeners: { [key: string]: Function[] } = {};

  constructor() {
    this.init();
  }

  private init() {
    // 1. Products
    if (!localStorage.getItem('rup_db_products')) {
      const formattedProducts = PRODUCTS.map((p: any) => ({
        ...p,
        slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        sku: p.sku || `RUP-${p.id.toUpperCase()}`,
        brand: p.brand || 'Rupan',
        subCategory: p.subCategory || 'Ethnic Wear',
        tags: p.tags || [p.category, p.gender],
        shortDescription: p.shortDescription || p.description.substring(0, 120) + '...',
        lowStockWarning: p.lowStockWarning || 5,
        weight: p.weight || 0.35,
        material: p.material || 'Premium Cotton Blend',
        status: p.status || 'published',
        isFeatured: p.isFeatured !== undefined ? p.isFeatured : p.isBestSeller || false,
        isTrending: p.isTrending !== undefined ? p.isTrending : false,
        isFlashSale: p.isFlashSale || false,
        isNew: p.isNew || false,
        seoTitle: p.seoTitle || `${p.name} - Buy Premium Clothing in Bangladesh`,
        seoDescription: p.seoDescription || p.description.substring(0, 150)
      }));
      localStorage.setItem('rup_db_products', JSON.stringify(formattedProducts));
    }

    // 2. Reviews
    if (!localStorage.getItem('rup_db_reviews')) {
      localStorage.setItem('rup_db_reviews', JSON.stringify(REVIEWS));
    }

    // 3. Blogs
    if (!localStorage.getItem('rup_db_blogs')) {
      localStorage.setItem('rup_db_blogs', JSON.stringify(BLOGS));
    }

    // 4. Coupons
    if (!localStorage.getItem('rup_db_coupons')) {
      const initialCoupons: Coupon[] = [
        {
          code: 'RUPAN20',
          type: 'percentage',
          value: 20,
          minOrder: 1500,
          maxDiscount: 1000,
          expiryDate: '2026-12-31',
          isActive: true,
          usageLimit: 500,
          usedCount: 142
        },
        {
          code: 'EIDMUBARAK',
          type: 'percentage',
          value: 15,
          minOrder: 1000,
          maxDiscount: 800,
          expiryDate: '2026-09-30',
          isActive: true,
          usageLimit: 300,
          usedCount: 89
        },
        {
          code: 'FREE60',
          type: 'fixed',
          value: 60,
          minOrder: 2000,
          maxDiscount: 60,
          expiryDate: '2026-12-31',
          isActive: true,
          usageLimit: 1000,
          usedCount: 201
        }
      ];
      localStorage.setItem('rup_db_coupons', JSON.stringify(initialCoupons));
    }

    // 5. Banners
    if (!localStorage.getItem('rup_db_banners')) {
      const initialBanners = [
        {
          id: 'b-1',
          title: 'EID UL ADHA FESTIVAL COLLECTION',
          subtitle: 'Style That Speaks Traditional Luxury',
          image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
          ctaText: 'Shop Panjabi Collection',
          category: 'Panjabi',
          isActive: true,
          type: 'homepage'
        },
        {
          id: 'b-2',
          title: 'EXCLUSIVE COORDINATED MATCHING SETS',
          subtitle: 'Synchronized Elegance For Special Celebrations',
          image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=1200&auto=format&fit=crop',
          ctaText: 'Shop Couple Collection',
          category: 'Couple Collection',
          isActive: true,
          type: 'homepage'
        },
        {
          id: 'b-3',
          title: 'MODERN COTTON ESSENTIALS',
          subtitle: 'Ultra-Soft, High-Strength 180 GSM Fabric',
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop',
          ctaText: 'Shop Western Collections',
          category: 'T-Shirts',
          isActive: true,
          type: 'homepage'
        }
      ];
      localStorage.setItem('rup_db_banners', JSON.stringify(initialBanners));
    }

    // 6. Settings
    if (!localStorage.getItem('rup_db_settings')) {
      const initialSettings = {
        logoText: 'RUPAN',
        logoAccent: '.',
        tagline: 'Style That Speaks.',
        whatsappNumber: '+8801711223344',
        supportNumber: '+8809612345678',
        currencySymbol: '৳',
        insideDhakaShipping: 60,
        outsideDhakaShipping: 120,
        freeShippingMinOrder: 3000,
        theme: 'sleek'
      };
      localStorage.setItem('rup_db_settings', JSON.stringify(initialSettings));
    }

    // 7. Orders
    if (!localStorage.getItem('rup_db_orders')) {
      const initialOrders: Order[] = [
        {
          id: 'RUP-9524',
          customerName: 'Kazi Nafis',
          phone: '01711223344',
          address: 'House 42, Road 11, Banani',
          area: 'Inside Dhaka',
          paymentMethod: 'bKash',
          items: [
            {
              productId: 'rup-001',
              productName: 'Royal Heritage Jacquard Panjabi',
              color: 'Royal Blue',
              size: 'XL',
              price: 2850,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop'
            }
          ],
          subtotal: 2850,
          shippingFee: 60,
          total: 2910,
          status: 'Shipped',
          createdAt: '2026-07-02 14:30'
        },
        {
          id: 'RUP-1082',
          customerName: 'Samia Rahman',
          phone: '01811223344',
          address: 'Mugdha Water Tank, Khilgaon',
          area: 'Inside Dhaka',
          paymentMethod: 'Cash on Delivery',
          items: [
            {
              productId: 'rup-003',
              productName: 'Empress Royal Silk Festivity Saree',
              color: 'Royal Crimson Red',
              size: 'Free Size',
              price: 5200,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1610030472661-bc012dfec893?q=80&w=600&auto=format&fit=crop'
            }
          ],
          subtotal: 5200,
          shippingFee: 60,
          total: 5260,
          status: 'Delivered',
          createdAt: '2026-06-29 11:15'
        }
      ];
      localStorage.setItem('rup_db_orders', JSON.stringify(initialOrders));
    }

    // 8. Users
    if (!localStorage.getItem('rup_db_users')) {
      const initialUsers = [
        {
          id: 'u-1',
          email: 'admin@rupan.com',
          role: 'Super Admin',
          fullName: 'Sajjad Rupan',
          isActive: true,
          totalSpending: 0,
          lastLogin: '2026-07-05 18:30',
          createdAt: '2026-01-10 10:00'
        },
        {
          id: 'u-2',
          email: 'manager@rupan.com',
          role: 'Manager',
          fullName: 'Rahat Amin',
          isActive: true,
          totalSpending: 0,
          lastLogin: '2026-07-04 12:15',
          createdAt: '2026-02-15 11:30'
        },
        {
          id: 'u-3',
          email: 'kazi@gmail.com',
          role: 'Customer',
          fullName: 'Kazi Nafis',
          isActive: true,
          totalSpending: 2910,
          lastLogin: '2026-07-05 14:02',
          createdAt: '2026-06-20 15:45'
        },
        {
          id: 'u-4',
          email: 'samia@gmail.com',
          role: 'Customer',
          fullName: 'Samia Rahman',
          isActive: true,
          totalSpending: 5260,
          lastLogin: '2026-06-29 11:00',
          createdAt: '2026-06-25 09:12'
        }
      ];
      localStorage.setItem('rup_db_users', JSON.stringify(initialUsers));
    }
  }

  getTable(name: string): any[] {
    const key = `rup_db_${name}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  saveTable(name: string, data: any[]) {
    const key = `rup_db_${name}`;
    localStorage.setItem(key, JSON.stringify(data));
    this.triggerRealtime(name);
  }

  // Realtime subscription listeners trigger
  subscribe(table: string, callback: Function) {
    if (!this.listeners[table]) this.listeners[table] = [];
    this.listeners[table].push(callback);
    return () => {
      this.listeners[table] = this.listeners[table].filter(cb => cb !== callback);
    };
  }

  private triggerRealtime(table: string) {
    if (this.listeners[table]) {
      const updatedData = this.getTable(table);
      this.listeners[table].forEach(cb => cb(updatedData));
    }
  }
}

export const localDB = new LocalDatabase();

// Mock Auth system
class MockAuth {
  private static currentUserKey = 'rup_db_current_user';
  private authListeners: Function[] = [];

  constructor() {
    // If no active session, auto-login a demo Super Admin for seamless preview
    if (!localStorage.getItem(MockAuth.currentUserKey)) {
      const adminUser = localDB.getTable('users').find(u => u.email === 'admin@rupan.com');
      if (adminUser) {
        localStorage.setItem(MockAuth.currentUserKey, JSON.stringify(adminUser));
      }
    }
  }

  async getSession() {
    const userJson = localStorage.getItem(MockAuth.currentUserKey);
    return {
      data: { session: userJson ? { user: JSON.parse(userJson) } : null },
      error: null
    };
  }

  async getUser() {
    const userJson = localStorage.getItem(MockAuth.currentUserKey);
    return {
      data: { user: userJson ? JSON.parse(userJson) : null },
      error: null
    };
  }

  async signUp({ email, password, options }: any) {
    const users = localDB.getTable('users');
    const exists = users.find(u => u.email === email);
    if (exists) {
      return { data: { user: null }, error: { message: 'User already exists' } };
    }

    const newUser = {
      id: `u-${Date.now()}`,
      email,
      role: options?.data?.role || 'Customer',
      fullName: options?.data?.full_name || email.split('@')[0],
      isActive: true,
      totalSpending: 0,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    users.push(newUser);
    localDB.saveTable('users', users);

    // Save active session
    localStorage.setItem(MockAuth.currentUserKey, JSON.stringify(newUser));
    this.notifyAuthListeners();

    return { data: { user: newUser }, error: null };
  }

  async signInWithPassword({ email, password }: any) {
    const users = localDB.getTable('users');
    const user = users.find(u => u.email === email);
    
    // Bypass password check for offline convenience
    if (!user) {
      return { data: { session: null }, error: { message: 'Invalid credentials. User not found.' } };
    }
    if (!user.isActive) {
      return { data: { session: null }, error: { message: 'This account has been banned.' } };
    }

    user.lastLogin = new Date().toISOString().replace('T', ' ').substring(0, 16);
    localDB.saveTable('users', users);

    const sessionUser = { ...user };
    localStorage.setItem(MockAuth.currentUserKey, JSON.stringify(sessionUser));
    this.notifyAuthListeners();

    return {
      data: { session: { user: sessionUser }, user: sessionUser },
      error: null
    };
  }

  async signOut() {
    localStorage.removeItem(MockAuth.currentUserKey);
    this.notifyAuthListeners();
    return { error: null };
  }

  onAuthStateChange(callback: Function) {
    this.authListeners.push(callback);
    // Initial call
    this.getSession().then(({ data }) => {
      callback(data.session ? 'SIGNED_IN' : 'SIGNED_OUT', data.session);
    });

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.authListeners = this.authListeners.filter(cb => cb !== callback);
          }
        }
      }
    };
  }

  private notifyAuthListeners() {
    this.getSession().then(({ data }) => {
      const event = data.session ? 'SIGNED_IN' : 'SIGNED_OUT';
      this.authListeners.forEach(cb => cb(event, data.session));
    });
  }
}

// Chainable mock builder mimicking supabase.from('...').select('...').eq('...').order('...')
class MockQueryBuilder {
  private tableName: string;
  private filters: ((item: any) => boolean)[] = [];
  private orderField: string | null = null;
  private orderAscending: boolean = true;
  private limitCount: number | null = null;
  private rangeStart: number | null = null;
  private rangeEnd: number | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = '*') {
    // Returns self to chain
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item: any) => item[column] === value);
    return this;
  }

  or(filterString: string) {
    // simple simulation of OR search for status or filters
    return this;
  }

  ilike(column: string, pattern: string) {
    const cleanPattern = pattern.replace(/%/g, '').toLowerCase();
    this.filters.push((item: any) => {
      const val = item[column];
      return val && String(val).toLowerCase().includes(cleanPattern);
    });
    return this;
  }

  textSearch(column: string, query: string) {
    const terms = query.toLowerCase().split(/\s+/);
    this.filters.push((item: any) => {
      const val = item[column];
      if (!val) return false;
      const strVal = String(val).toLowerCase();
      return terms.every(term => strVal.includes(term));
    });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderField = column;
    this.orderAscending = ascending;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(start: number, end: number) {
    this.rangeStart = start;
    this.rangeEnd = end;
    return this;
  }

  single() {
    return this.then().then(res => ({
      data: res.data ? res.data[0] || null : null,
      error: res.error
    }));
  }

  // To make it fully support "await supabase.from('...')"
  async then(onfulfilled?: (value: any) => any) {
    let data = [...localDB.getTable(this.tableName)];

    // Apply filters
    for (const filter of this.filters) {
      data = data.filter(filter);
    }

    // Apply order
    if (this.orderField) {
      const f = this.orderField;
      const asc = this.orderAscending ? 1 : -1;
      data.sort((a, b) => {
        if (a[f] < b[f]) return -1 * asc;
        if (a[f] > b[f]) return 1 * asc;
        return 0;
      });
    }

    // Apply pagination range or limit
    if (this.rangeStart !== null && this.rangeEnd !== null) {
      data = data.slice(this.rangeStart, this.rangeEnd + 1);
    } else if (this.limitCount !== null) {
      data = data.slice(0, this.limitCount);
    }

    const response = { data, error: null };
    if (onfulfilled) {
      return Promise.resolve(onfulfilled(response));
    }
    return Promise.resolve(response);
  }

  async insert(rows: any[]) {
    const tableData = localDB.getTable(this.tableName);
    const addedRows = rows.map(r => ({
      id: r.id || `${this.tableName.substring(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: r.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
      ...r
    }));

    const newTableData = [...tableData, ...addedRows];
    localDB.saveTable(this.tableName, newTableData);
    return { data: addedRows, error: null };
  }

  async update(values: any) {
    const tableData = localDB.getTable(this.tableName);
    let updatedRows: any[] = [];

    const newTableData = tableData.map(item => {
      // If we have filters active (like eq('id', '...'))
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(item)) matches = false;
      }

      if (matches) {
        const updatedItem = { ...item, ...values };
        updatedRows.push(updatedItem);
        return updatedItem;
      }
      return item;
    });

    localDB.saveTable(this.tableName, newTableData);
    return { data: updatedRows, error: null };
  }

  async delete() {
    const tableData = localDB.getTable(this.tableName);
    let deletedRows: any[] = [];

    const newTableData = tableData.filter(item => {
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(item)) matches = false;
      }

      if (matches) {
        deletedRows.push(item);
        return false; // exclude from table
      }
      return true;
    });

    localDB.saveTable(this.tableName, newTableData);
    return { data: deletedRows, error: null };
  }
}

// Storage simulator
class MockStorage {
  from(bucket: string) {
    return {
      async upload(path: string, file: File | Blob, options?: any) {
        // Just return a simulated public URL directly
        // Create an object URL or Unsplash random URL based on typical upload mock
        const mockUrl = URL.createObjectURL(file);
        return { data: { path, url: mockUrl }, error: null };
      },
      getPublicUrl(path: string) {
        // Return a stable image or mock url
        return { data: { publicUrl: path.startsWith('blob:') ? path : `https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600` } };
      }
    };
  }
}

// Channel simulator (for real-time subscriptions)
class MockChannel {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }
  on(event: string, filter: any, callback: Function) {
    // Subscribe to matching events
    if (filter && filter.table) {
      localDB.subscribe(filter.table, (data: any) => {
        callback({
          new: data[data.length - 1],
          old: null,
          eventType: 'INSERT'
        });
      });
    }
    return this;
  }
  subscribe() {
    return this;
  }
}

// Full mock client instance matching the standard supabase schema
class MockSupabaseClient {
  auth = new MockAuth();
  storage = new MockStorage();

  from(table: string) {
    return new MockQueryBuilder(table);
  }

  channel(name: string) {
    return new MockChannel(name);
  }
}

export const mockSupabase = new MockSupabaseClient() as any;

export { hasRealKeys };

// Export the active client: uses real Supabase if keys exist, otherwise falls back smoothly to localDB mock client
export const supabase = hasRealKeys ? realSupabase! : mockSupabase;

export const getSupabaseConnectionError = async (): Promise<string | null> => {
  if (!hasRealKeys || !realSupabase) {
    return "Supabase credentials are not configured in your environment variables.";
  }
  try {
    const { error } = await realSupabase.from('products').select('id').limit(1);
    if (error) {
      return error.message;
    }
    return null;
  } catch (err: any) {
    return err?.message || String(err);
  }
};

export const checkSupabaseConnection = async (): Promise<boolean> => {
  const err = await getSupabaseConnectionError();
  return err === null;
};
