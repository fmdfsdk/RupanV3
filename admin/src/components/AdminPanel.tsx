import React, { useState, useEffect } from 'react';
import { 
  BarChart3, LayoutDashboard, ShoppingBag, ListOrdered, Users, Tag, Image, 
  FileText, MessageSquare, ShieldAlert, Plus, Edit, Trash2, Copy, Eye, 
  CheckCircle, XCircle, Search, Filter, RefreshCw, Upload, Link, Check, 
  X, FileDown, Calendar, Percent, Truck, HelpCircle, Smartphone, Lock, 
  UserCheck, AlertTriangle, Play, ChevronRight, Save, Info, Ban, Menu, Settings, Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { supabase } from '../lib/supabase';
import { Product, Order, Review, BlogPost, Coupon, Banner, WebsiteSettings, UserProfile } from '../types';
import { PRODUCTS } from '../data';

// Import Decomposed Tab Components
import OverviewTab from './tabs/OverviewTab';
import ProductsTab from './tabs/ProductsTab';
import OrdersTab from './tabs/OrdersTab';
import InventoryTab from './tabs/InventoryTab';
import CustomersTab from './tabs/CustomersTab';
import CouponsTab from './tabs/CouponsTab';
import HomepageTab from './tabs/HomepageTab';
import BlogsTab from './tabs/BlogsTab';
import ReviewsTab from './tabs/ReviewsTab';
import SettingsTab from './tabs/SettingsTab';
import SyncTab from './tabs/SyncTab';

interface AdminPanelProps {
  onClose: () => void;
  isSupabaseOnline?: boolean;
}

export default function AdminPanel({ onClose, isSupabaseOnline = false }: AdminPanelProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  
  // Database state fetched from Supabase (or fallback)
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings>({
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
  });

  // Sync state variables
  const [syncSources, setSyncSources] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [activeSource, setActiveSource] = useState<string>('mohasagor');
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncPage, setSyncPage] = useState<number>(1);
  const [syncLastPage, setSyncLastPage] = useState<number>(1);
  const [syncStats, setSyncStats] = useState({ fetched: 0, imported: 0, updated: 0, failed: 0 });
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Pagination states
  const [productsPage, setProductsPage] = useState<number>(1);
  const [totalProductsCount, setTotalProductsCount] = useState<number>(0);
  const [pageSize] = useState<number>(50);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['All']);

  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Homepage Config state
  const [homepageConfig, setHomepageConfig] = useState<any>({
    featured_categories: [],
    featured_product_ids: { trending: [], new_arrivals: [], best_sellers: [] }
  });

  // Modal / Form States
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [couponModalOpen, setCouponModalOpen] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [bannerModalOpen, setBannerModalOpen] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploadingBannerImage, setUploadingBannerImage] = useState<boolean>(false);
  const [bannerForm, setBannerForm] = useState<any>({
    title: '',
    subtitle: '',
    image: '',
    cta_text: 'SHOP NOW',
    category: '',
    type: 'homepage',
    is_active: true,
    publish_date: ''
  });

  const [blogModalOpen, setBlogModalOpen] = useState<boolean>(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  // Selected Order Detail View
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderTimeline, setOrderTimeline] = useState<string[]>([]);

  // Selected Customer Profile View
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);

  // Bulk Inventory Stock State
  const [bulkStockAdd, setBulkStockAdd] = useState<number>(0);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // User roles permissions state
  const [adminRole, setAdminRole] = useState<'Super Admin' | 'Admin' | 'Manager' | 'Editor' | 'Support' | 'Delivery Manager'>('Super Admin');
  const [permissions, setPermissions] = useState({
    products: true,
    orders: true,
    customers: true,
    coupons: true,
    banners: true,
    blogs: true,
    settings: true,
    reviews: true
  });

  // Product Form Input State
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    slug: '',
    sku: '',
    brand: 'Rupan',
    category: 'Panjabi',
    subCategory: 'Ethnic Wear',
    tags: [],
    gender: 'Men',
    price: 0,
    discountPrice: undefined,
    description: '',
    shortDescription: '',
    features: [],
    sizes: ['M', 'L', 'XL'],
    colors: [],
    stock: 20,
    lowStockWarning: 5,
    weight: 0.3,
    material: 'Premium Cotton Blend',
    status: 'published',
    isFeatured: false,
    isTrending: false,
    isFlashSale: false,
    isNew: true,
    seoTitle: '',
    seoDescription: '',
    images: ['']
  });

  // Dynamic values helper state for tags and colors
  const [newTag, setNewTag] = useState<string>('');
  const [newFeature, setNewFeature] = useState<string>('');
  const [newColorName, setNewColorName] = useState<string>('');
  const [newColorHex, setNewColorHex] = useState<string>('#1E3A8A');
  const [imageInputMethod, setImageInputMethod] = useState<'url' | 'upload'>('url');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');

  // Fetch all tables on mount (excluding products, which is paginated)
  useEffect(() => {
    fetchData();
  }, []);

  // Reset pagination page on search/filter changes
  useEffect(() => {
    setProductsPage(1);
  }, [searchQuery, filterCategory, filterStatus]);

  // Load paginated products page
  useEffect(() => {
    fetchProductsPage(productsPage, searchQuery, filterCategory, filterStatus);
  }, [productsPage, searchQuery, filterCategory, filterStatus]);

  const fetchProductsPage = async (page: number, search: string, category: string, status: string) => {
    try {
      if (!isSupabaseOnline) {
        // --- OFFLINE MOCK MODE ---
        let localData = PRODUCTS;
        const stored = localStorage.getItem('rup_db_products');
        if (stored) {
          try { localData = JSON.parse(stored); } catch (e) {}
        }
        
        // Filter in memory
        const filtered = localData.filter(p => {
          if (!p) return false;
          const nameStr = p.name ? String(p.name) : '';
          const catStr = p.category ? String(p.category) : '';
          const idStr = p.id ? String(p.id) : '';
          
          const matchesSearch = nameStr.toLowerCase().includes(search.toLowerCase()) || 
                                catStr.toLowerCase().includes(search.toLowerCase()) ||
                                idStr.toLowerCase().includes(search.toLowerCase());
          const matchesCategory = category === 'All' || p.category === category;
          const matchesStatus = status === 'All' || p.status === status;
          return matchesSearch && matchesCategory && matchesStatus;
        });
        
        setTotalProductsCount(filtered.length);
        const start = (page - 1) * pageSize;
        const pageData = filtered.slice(start, start + pageSize);
        setProducts(pageData);
        return;
      }
      
      // --- LIVE DATABASE MODE ---
      let dbQuery = supabase.from('products').select('*', { count: 'exact' });
      
      // Apply filters
      if (status !== 'All') {
        dbQuery = dbQuery.eq('status', status);
      }
      if (category !== 'All') {
        dbQuery = dbQuery.eq('category', category);
      }
      
      // Search query (fuzzy search on name/sku/id)
      if (search.trim()) {
        const queryTerm = `%${search.trim()}%`;
        dbQuery = dbQuery.or(`name.ilike.${queryTerm},sku.ilike.${queryTerm},id.ilike.${queryTerm}`);
      }
      
      // Pagination range
      const start = (page - 1) * pageSize;
      const end = page * pageSize - 1;
      
      const { data, count, error } = await dbQuery
        .order('updated_at', { ascending: false })
        .range(start, end);
        
      if (error) throw error;
      
      if (data) setProducts(data);
      if (count !== null) setTotalProductsCount(count);
      
    } catch (err: any) {
      console.error("Error fetching products page:", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: oData } = await supabase.from('orders').select('*');
      const { data: cData } = await supabase.from('coupons').select('*');
      const { data: bData } = await supabase.from('banners').select('*');
      const { data: blData } = await supabase.from('blogs').select('*');
      const { data: rData } = await supabase.from('reviews').select('*');
      const { data: uData } = await supabase.from('users').select('*');
      const { data: sData } = await supabase.from('settings').select('*').single();

      if (oData) {
        // Sort orders descending
        const sortedOrders = [...oData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(sortedOrders);
      }
      if (cData) setCoupons(cData);
      if (bData) setBanners(bData);
      if (blData) setBlogs(blData);
      if (rData) setReviews(rData);
      if (uData) setUsers(uData);
      if (sData) {
        setSettings({
          id: sData.id,
          logoText: sData.logo_text || sData.logoText || 'RUPAN',
          logoAccent: sData.logo_accent || sData.logoAccent || '.',
          tagline: sData.tagline || 'Style That Speaks.',
          whatsappNumber: sData.whatsapp_number || sData.whatsappNumber || '+8801711223344',
          supportNumber: sData.support_number || sData.supportNumber || '+8809612345678',
          currencySymbol: sData.currency_symbol || sData.currencySymbol || '৳',
          insideDhakaShipping: Number(sData.inside_dhaka_shipping ?? sData.insideDhakaShipping ?? 60),
          outsideDhakaShipping: Number(sData.outside_dhaka_shipping ?? sData.outsideDhakaShipping ?? 120),
          freeShippingMinOrder: Number(sData.free_shipping_min_order ?? sData.freeShippingMinOrder ?? 3000),
          theme: sData.theme || 'sleek',
          metaPixelId: sData.meta_pixel_id || sData.metaPixelId || '',
          metaTestEventCode: sData.meta_test_event_code || sData.metaTestEventCode || '',
          googleTagManagerId: sData.google_tag_manager_id || sData.googleTagManagerId || '',
          googleAnalyticsId: sData.google_analytics_id || sData.googleAnalyticsId || ''
        });
        const hConfig = sData.homepageConfig || sData.homepage_config;
        if (hConfig) {
          setHomepageConfig(hConfig);
        }
      }

      // Fetch sync sources & logs
      const { data: sourcesData } = await supabase.from('sync_sources').select('*');
      const { data: logsData } = await supabase.from('sync_logs').select('*').order('started_at', { ascending: false }).limit(20);
      
      const sourcesFallback = [
        { id: 'mohasagor', name: 'Mohasagor Reseller API', type: 'api', api_url: 'https://mohasagor.com.bd/api/reseller/product', is_active: true, config: { markup_percentage: 25 }, last_sync_at: '2026-07-08 14:30' }
      ];
      const logsFallback = [
        { id: 'log-1', source_id: 'mohasagor', status: 'success', items_fetched: 2747, items_imported: 120, items_updated: 2627, items_failed: 0, started_at: '2026-07-08 14:00', completed_at: '2026-07-08 14:15' }
      ];
      
      if (sourcesData && sourcesData.length > 0) setSyncSources(sourcesData); else setSyncSources(sourcesFallback);
      if (logsData && logsData.length > 0) setSyncLogs(logsData); else setSyncLogs(logsFallback);

      if (isSupabaseOnline) {
        const { data: catData } = await supabase.from('products').select('category');
        if (catData) {
          const uniqueCats = Array.from(new Set(catData.map(c => (c as any).category).filter(Boolean))) as string[];
          setAvailableCategories(['All', ...uniqueCats]);
        }
      } else {
        let localData = PRODUCTS;
        const stored = localStorage.getItem('rup_db_products');
        if (stored) {
          try { localData = JSON.parse(stored); } catch (e) {}
        }
        const uniqueCats = Array.from(new Set(localData.map(p => p.category).filter(Boolean)));
        setAvailableCategories(['All', ...uniqueCats]);
      }

    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Quick Action: Save settings
  const handleSaveSettings = async () => {
    try {
      const payload = {
        logo_text: settings.logoText,
        logo_accent: settings.logoAccent,
        tagline: settings.tagline,
        whatsapp_number: settings.whatsappNumber,
        support_number: settings.supportNumber,
        currency_symbol: settings.currencySymbol,
        inside_dhaka_shipping: Number(settings.insideDhakaShipping),
        outside_dhaka_shipping: Number(settings.outsideDhakaShipping),
        free_shipping_min_order: Number(settings.freeShippingMinOrder),
        theme: settings.theme,
        meta_pixel_id: settings.metaPixelId,
        meta_test_event_code: settings.metaTestEventCode,
        google_tag_manager_id: settings.googleTagManagerId,
        google_analytics_id: settings.googleAnalyticsId,
        // Mock compatibility keys
        logoText: settings.logoText,
        logoAccent: settings.logoAccent,
        whatsappNumber: settings.whatsappNumber,
        supportNumber: settings.supportNumber,
        currencySymbol: settings.currencySymbol,
        insideDhakaShipping: Number(settings.insideDhakaShipping),
        outsideDhakaShipping: Number(settings.outsideDhakaShipping),
        freeShippingMinOrder: Number(settings.freeShippingMinOrder),
        metaPixelId: settings.metaPixelId,
        metaTestEventCode: settings.metaTestEventCode,
        googleTagManagerId: settings.googleTagManagerId,
        googleAnalyticsId: settings.googleAnalyticsId
      };
      
      const { error } = await supabase.from('settings').update(payload).eq('id', settings.id || 1);
      if (!error) {
        alert("Website configurations updated successfully!");
      } else {
        alert(`Error saving settings: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Synchronize reseller products page-by-page
  const runSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncProgress(0);
    setSyncPage(1);
    setSyncLastPage(1);
    setSyncStats({ fetched: 0, imported: 0, updated: 0, failed: 0 });

    const targetSource = activeSource;
    const startTime = new Date().toISOString();

    try {
      if (!isSupabaseOnline) {
        // --- SIMULATED SYNC MODE (Offline Fallback) ---
        let page = 1;
        const lastPage = 14;
        setSyncLastPage(lastPage);

        while (page <= lastPage) {
          setSyncPage(page);
          setSyncProgress(Math.round((page / lastPage) * 100));
          setSyncStats(prev => ({
            fetched: prev.fetched + (page === 14 ? 147 : 200),
            imported: prev.imported + (page === 14 ? 10 : 10),
            updated: prev.updated + (page === 14 ? 137 : 190),
            failed: prev.failed
          }));
          // Wait 200ms
          await new Promise(resolve => setTimeout(resolve, 200));
          page++;
        }

        // Add a mock log entry
        const mockLog = {
          id: `log-${Date.now()}`,
          source_id: targetSource,
          status: 'success',
          items_fetched: 2747,
          items_imported: 140,
          items_updated: 2607,
          items_failed: 0,
          started_at: startTime.replace('T', ' ').replace('Z', '').substring(0, 16),
          completed_at: new Date().toISOString().replace('T', ' ').replace('Z', '').substring(0, 16)
        };

        const updatedLogs = [mockLog, ...syncLogs];
        setSyncLogs(updatedLogs);

        // Load mock products to state to show in dashboard catalog
        const formattedProducts: Product[] = PRODUCTS.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          sku: p.sku || `RUP-${p.id.toUpperCase()}`,
          brand: p.brand || 'Rupan',
          category: p.category || 'General',
          subCategory: p.subCategory || '',
          tags: p.tags || [],
          gender: p.gender || 'Men',
          price: Number(p.discountPrice || p.price || 0),
          discountPrice: p.discountPrice ? Number(p.price) : undefined,
          reviewsCount: Number(p.reviewsCount || 0),
          rating: Number(p.rating || 5.0),
          images: p.images || [],
          colors: p.colors || [],
          sizes: p.sizes || [],
          description: p.description || '',
          shortDescription: p.shortDescription || '',
          features: p.features || [],
          stock: p.stock || 50,
          lowStockWarning: p.lowStockWarning || 5,
          weight: p.weight || 0.35,
          material: p.material || 'Premium Quality Blend',
          status: p.status || 'published',
          isFeatured: p.isFeatured || false,
          isTrending: p.isTrending || false,
          isNew: p.isNew || false,
          isBestSeller: p.isBestSeller || false,
          isFlashSale: p.isFlashSale || false
        }) as any);
        setProducts(formattedProducts);
        
        // Save to LocalStorage for offline database persistence
        localStorage.setItem('rup_db_products', JSON.stringify(formattedProducts));
        
        alert("Simulated Sync Completed!\nProcessed 2,747 products across 14 pages.\nImported: 140 new products\nUpdated: 2,607 products\nFailed: 0");
        setSyncing(false);
        return;
      }

      // --- REAL DATABASE SYNC MODE ---
      let currentPage = 1;
      let lastPage = 1;
      let totalImported = 0;
      let totalUpdated = 0;
      let totalFailed = 0;

      while (currentPage <= lastPage) {
        setSyncPage(currentPage);
        
        // Fetch token and call serverless Sync API
        const sessionRes = await supabase.auth.getSession();
        const token = sessionRes.data.session?.access_token;
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/sync?source=${targetSource}&page=${currentPage}`, {
          headers
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Sync API failed at page ${currentPage}: ${errorText}`);
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || `Sync failed at page ${currentPage}`);
        }

        if (currentPage === 1) {
          lastPage = result.last_page || 1;
          setSyncLastPage(lastPage);
        }

        totalImported += result.imported || 0;
        totalUpdated += result.updated || 0;
        totalFailed += result.failed || 0;

        setSyncStats(prev => ({
          fetched: prev.fetched + (result.items_fetched || 0),
          imported: prev.imported + (result.imported || 0),
          updated: prev.updated + (result.updated || 0),
          failed: prev.failed + (result.failed || 0)
        }));

        setSyncProgress(Math.round((currentPage / lastPage) * 100));
        currentPage++;
      }

      alert(`Sync Completed Successfully!\nProcessed: ${totalImported + totalUpdated + totalFailed} products\nImported: ${totalImported}\nUpdated: ${totalUpdated}\nFailed: ${totalFailed}`);
      
      // Reload logs & overview data
      const { data: logsData } = await supabase.from('sync_logs').select('*').order('started_at', { ascending: false }).limit(20);
      if (logsData) setSyncLogs(logsData);
      
      // Reload products list
      const { data: pData } = await supabase.from('products').select('*').limit(5000);
      if (pData) setProducts(pData);

    } catch (err: any) {
      console.error("Sync Error:", err);
      alert(`Sync Failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product? This is irreversible.")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        setProducts(products.filter(p => p.id !== id));
      }
    }
  };

  // Open Product Modal
  const openProductForm = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        slug: '',
        sku: `RUP-${Math.floor(1000 + Math.random() * 9000)}`,
        brand: 'Rupan',
        category: 'Panjabi',
        subCategory: 'Ethnic Wear',
        tags: ['Ethnic', 'New'],
        gender: 'Men',
        price: 2500,
        discountPrice: 2000,
        description: 'Premium quality traditional clothing crafted meticulously with high attention to detail.',
        shortDescription: 'Modern regular fit ethnic clothing.',
        features: ['Handcrafted tailoring details', 'Lightweight and soft feel'],
        sizes: ['M', 'L', 'XL'],
        colors: [{ name: 'Royal Blue', class: 'bg-blue-900', hex: '#1E3A8A' }],
        stock: 35,
        lowStockWarning: 5,
        weight: 0.35,
        material: 'Premium Silk Cotton',
        status: 'published',
        isFeatured: true,
        isTrending: false,
        isFlashSale: false,
        isNew: true,
        seoTitle: 'Buy Handcrafted Silk Cotton Panjabi - Rupan',
        seoDescription: 'Intricate design details made with double-ply long-staple cotton.',
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600']
      });
    }
    setProductModalOpen(true);
  };

  // Save/Update product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.category || !productForm.price) {
      alert("Please fill in Name, Category, and Price");
      return;
    }

    const finalProduct = {
      ...productForm,
      id: editingProduct ? editingProduct.id : `rup-${Date.now()}`,
      slug: productForm.slug || productForm.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
      rating: editingProduct ? editingProduct.rating : 5.0
    } as Product;

    if (editingProduct) {
      const { error } = await supabase.from('products').update(finalProduct).eq('id', editingProduct.id);
      if (!error) {
        setProducts(products.map(p => p.id === editingProduct.id ? finalProduct : p));
      }
    } else {
      const { error } = await supabase.from('products').insert([finalProduct]);
      if (!error) {
        setProducts([...products, finalProduct]);
      }
    }
    setProductModalOpen(false);
  };

  // Duplicate Product
  const handleDuplicateProduct = async (product: Product) => {
    const duplicated: Product = {
      ...product,
      id: `rup-copy-${Date.now()}`,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
      slug: `${product.slug}-copy`,
      reviewsCount: 0,
      rating: 5.0
    };
    const { error } = await supabase.from('products').insert([duplicated]);
    if (!error) {
      setProducts([...products, duplicated]);
      alert("Product duplicated successfully!");
    }
  };

  // Toggle order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, status: newStatus };
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updated);
        }
        return updated;
      }
      return o;
    });
    
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      setOrders(updatedOrders);
      // Simulate/Add to tracking timeline
      setOrderTimeline(prev => [...prev, `Order status updated to ${newStatus} at ${new Date().toLocaleString()}`]);
    }
  };

  // Toggle order payment status
  const handleUpdateOrderPayment = async (orderId: string, newPaymentStatus: Order['paymentStatus']) => {
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, paymentStatus: newPaymentStatus };
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updated);
        }
        return updated;
      }
      return o;
    });

    const { error } = await supabase.from('orders').update({ paymentStatus: newPaymentStatus }).eq('id', orderId);
    if (!error) {
      setOrders(updatedOrders);
    }
  };

  // Ban/Unban user
  const handleToggleUserActive = async (user: UserProfile) => {
    const updatedStatus = !user.isActive;
    const { error } = await supabase.from('users').update({ isActive: updatedStatus }).eq('id', user.id);
    if (!error) {
      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: updatedStatus } : u));
      if (selectedCustomer?.id === user.id) {
        setSelectedCustomer({ ...selectedCustomer, isActive: updatedStatus });
      }
    }
  };

  // Bulk stock update helper
  const handleBulkStockUpdate = async () => {
    if (selectedProductIds.length === 0) {
      alert("Please select at least one product using checkboxes.");
      return;
    }

    const rowsToUpsert = selectedProductIds.map(id => {
      const p = products.find(prod => prod.id === id);
      const currentStock = p?.stock || 0;
      const newStock = Math.max(0, currentStock + bulkStockAdd);
      return { id, stock: newStock };
    });

    setLoading(true);
    const { error } = await supabase.from('products').upsert(rowsToUpsert);
    setLoading(false);

    if (error) {
      alert(`Error updating database: ${error.message}`);
      return;
    }

    const updated = products.map(p => {
      if (selectedProductIds.includes(p.id)) {
        const currentStock = p.stock || 0;
        const newStock = Math.max(0, currentStock + bulkStockAdd);
        return { ...p, stock: newStock };
      }
      return p;
    });

    // Save to LocalStorage if in offline demo mode
    if (!isSupabaseOnline) {
      localStorage.setItem('rup_db_products', JSON.stringify(updated));
    }

    setProducts(updated);
    setSelectedProductIds([]);
    setBulkStockAdd(0);
    alert("Bulk inventory levels updated successfully!");
  };

  // Helper arrays for analytical computations
  const getOverviewStats = () => {
    const totalSales = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    
    const pendingSales = orders
      .filter(o => o.status === 'Pending')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
    const lowStockCount = products.filter(p => p.stock <= (p.lowStockWarning || 5)).length;

    // Monthly aggregation
    const monthlySales = totalSales * 0.85; // Simulated distribution
    const conversionRate = 3.25; // Simulated eCommerce standard
    const visitorsCount = 12450; // Simulated

    return {
      totalSales,
      pendingSales,
      pendingCount,
      deliveredCount,
      lowStockCount,
      monthlySales,
      conversionRate,
      visitorsCount
    };
  };

  const stats = getOverviewStats();

  // Simulated Charts Data
  const salesChartData = [
    { date: 'Jun 29', Sales: 34200, Orders: 8, Visitors: 420 },
    { date: 'Jun 30', Sales: 52000, Orders: 12, Visitors: 510 },
    { date: 'Jul 01', Sales: 41000, Orders: 10, Visitors: 480 },
    { date: 'Jul 02', Sales: 61500, Orders: 14, Visitors: 580 },
    { date: 'Jul 03', Sales: 78000, Orders: 18, Visitors: 690 },
    { date: 'Jul 04', Sales: 92400, Orders: 21, Visitors: 780 },
    { date: 'Jul 05', Sales: stats.totalSales, Orders: orders.length, Visitors: 850 },
  ];

  const categoryPieData = [
    { name: 'Panjabi', value: 45 },
    { name: 'Saree', value: 25 },
    { name: 'Shirts', value: 15 },
    { name: 'Couple Sets', value: 10 },
    { name: 'Accessories', value: 5 },
  ];

  const trafficSourceData = [
    { name: 'Facebook Ads', value: 55 },
    { name: 'Organic Search', value: 20 },
    { name: 'WhatsApp Direct', value: 15 },
    { name: 'Instagram Shop', value: 10 },
  ];

  const COLORS = ['#1E3A8A', '#D4AF37', '#10B981', '#EF4444', '#8B5CF6'];

  // Add tag to product form
  const addTag = () => {
    if (newTag.trim() && !productForm.tags?.includes(newTag.trim())) {
      setProductForm({
        ...productForm,
        tags: [...(productForm.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setProductForm({
      ...productForm,
      tags: productForm.tags?.filter(t => t !== tag) || []
    });
  };

  // Add custom features list
  const addFeature = () => {
    if (newFeature.trim()) {
      setProductForm({
        ...productForm,
        features: [...(productForm.features || []), newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (idx: number) => {
    setProductForm({
      ...productForm,
      features: productForm.features?.filter((_, i) => i !== idx) || []
    });
  };

  // Add custom color config
  const addColor = () => {
    if (newColorName.trim()) {
      const addedColor = {
        name: newColorName.trim(),
        hex: newColorHex,
        class: `bg-[${newColorHex}]`
      };
      setProductForm({
        ...productForm,
        colors: [...(productForm.colors || []), addedColor]
      });
      setNewColorName('');
    }
  };

  const removeColor = (idx: number) => {
    setProductForm({
      ...productForm,
      colors: productForm.colors?.filter((_, i) => i !== idx) || []
    });
  };

  // Apply quick image URLs
  const addImageUrl = () => {
    if (customImageUrl.trim()) {
      setProductForm({
        ...productForm,
        images: [...(productForm.images || []), customImageUrl.trim()]
      });
      setCustomImageUrl('');
    }
  };

  // Banner Actions
  const openBannerForm = (banner: any | null) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerForm({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        image: banner.image || '',
        cta_text: banner.cta_text || 'SHOP NOW',
        category: banner.category || '',
        type: banner.type || 'homepage',
        is_active: banner.is_active ?? true,
        publish_date: banner.publish_date || ''
      });
    } else {
      setEditingBanner(null);
      setBannerForm({
        title: '',
        subtitle: '',
        image: '',
        cta_text: 'SHOP NOW',
        category: '',
        type: 'homepage',
        is_active: true,
        publish_date: ''
      });
    }
    setBannerModalOpen(true);
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBannerImage(true);
    try {
      // 1. Try to create bucket 'banners' if it doesn't exist
      try {
        await supabase.storage.createBucket('banners', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
      } catch (e) {}

      // 2. Upload file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('banners')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // 3. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      setBannerForm((prev: any) => ({
        ...prev,
        image: publicUrl
      }));
      alert("Image uploaded successfully!");
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploadingBannerImage(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.image) {
      alert("Please enter at least Title and Image URL.");
      return;
    }

    setLoading(true);
    try {
      if (editingBanner) {
        const { data, error } = await supabase
          .from('banners')
          .update({
            title: bannerForm.title,
            subtitle: bannerForm.subtitle,
            image: bannerForm.image,
            cta_text: bannerForm.cta_text,
            category: bannerForm.category,
            type: bannerForm.type,
            is_active: bannerForm.is_active,
            publish_date: bannerForm.publish_date || null
          })
          .eq('id', editingBanner.id)
          .select();

        if (error) throw error;
        if (data && data[0]) {
          setBanners(prev => prev.map(b => b.id === editingBanner.id ? data[0] : b));
        }
      } else {
        const { data, error } = await supabase
          .from('banners')
          .insert([{
            title: bannerForm.title,
            subtitle: bannerForm.subtitle,
            image: bannerForm.image,
            cta_text: bannerForm.cta_text,
            category: bannerForm.category,
            type: bannerForm.type,
            is_active: bannerForm.is_active,
            publish_date: bannerForm.publish_date || null
          }])
          .select();

        if (error) throw error;
        if (data && data[0]) {
          setBanners(prev => [data[0], ...prev]);
        }
      }
      setBannerModalOpen(false);
      alert("Banner slide saved successfully!");
    } catch (err: any) {
      alert(`Error saving banner: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm("Are you sure you want to delete this banner slide permanently?")) return;
    setLoading(true);
    const { error } = await supabase.from('banners').delete().eq('id', bannerId);
    setLoading(false);
    if (!error) {
      setBanners(prev => prev.filter(b => b.id !== bannerId));
      alert("Banner slide deleted!");
    } else {
      alert(`Error deleting banner: ${error.message}`);
    }
  };


  // Filter products (resolved server-side in paginated query)
  const filteredProducts = products;

  return (
    <div className="fixed inset-0 z-50 bg-[#F8F9FA] flex flex-col font-sans overflow-hidden text-zinc-800">
      
      {/* Admin Top Navbar */}
      <div className="bg-zinc-900 text-white h-16 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 cursor-pointer"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 select-none">
            <div className="bg-white border border-zinc-700 rounded-lg p-1 px-2.5 flex items-center justify-center max-h-[36px] shadow-sm">
              <img 
                src="/assets/Rupan Logo Final.png" 
                alt="Rupan Logo" 
                width={200}
                height={200}
                className="h-5 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xs md:text-sm tracking-tight text-white uppercase">
                ADMIN ZONE
              </span>
              <span className="text-[8px] md:text-[9px] text-zinc-400 font-mono tracking-widest uppercase -mt-0.5">
                v3.0 // Role: {adminRole}
              </span>
            </div>
          </div>
          
          {/* Quick role toggler for preview convenience */}
          <div className="hidden lg:flex items-center bg-zinc-800 rounded-lg px-2 py-1 text-xs space-x-2 border border-zinc-700">
            <span className="text-zinc-500 font-semibold uppercase text-[9px]">Preview Role:</span>
            <select 
              value={adminRole} 
              onChange={(e) => setAdminRole(e.target.value as any)}
              className="bg-zinc-900 text-brand-accent text-xs font-bold border-none py-0.5 focus:ring-0 rounded cursor-pointer"
            >
              <option value="Super Admin">Super Admin (All Access)</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Editor">Editor</option>
              <option value="Support">Support Desk</option>
              <option value="Delivery Manager">Delivery Manager</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={fetchData}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            title="Refresh Store Database"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={onClose}
            className="bg-brand-accent text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-2 hover:bg-yellow-600 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Go to Storefront</span>
          </button>
        </div>
      </div>

      {/* Admin Dashboard Sidebar & Body Content wrapper */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Control Sidebar */}
        {mobileSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 z-20 bg-black/40 backdrop-blur-xs" 
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <div className={`w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto transition-transform duration-300 md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 fixed inset-y-16 left-0 z-30 shadow-2xl h-[calc(100vh-4rem)]' : '-translate-x-full md:translate-x-0 fixed md:relative h-full'
        }`}>
          <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center font-bold">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Sajjad Rupan</h3>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">{adminRole}</p>
            </div>
          </div>

          <nav className="p-4 flex-1 space-y-1">
            <button
              onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'overview' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab('products'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'products' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Product Catalog</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('orders'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ListOrdered className="w-4 h-4" />
                <span>Orders Index</span>
              </div>
              {stats.pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold h-5 px-1.5 rounded-full flex items-center justify-center animate-pulse">
                  {stats.pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('inventory'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'inventory' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-4 h-4" />
                <span>Bulk Inventory</span>
              </div>
              {stats.lowStockCount > 0 && (
                <span className="bg-yellow-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                  {stats.lowStockCount} ALERT
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('customers'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'customers' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customers</span>
            </button>

            <button
              onClick={() => { setActiveTab('coupons'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'coupons' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Coupon Engine</span>
            </button>

            <button
              onClick={() => { setActiveTab('homepage'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'homepage' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-orange-500" />
              <span>Homepage Manager</span>
            </button>

            <button
              onClick={() => { setActiveTab('blogs'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'blogs' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Blog Management</span>
            </button>

            <button
              onClick={() => { setActiveTab('reviews'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'reviews' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-4 h-4" />
                <span>Reviews Board</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('sync'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'sync' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync Manager</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Global Settings</span>
            </button>
          </nav>

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-400">
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              <span>SSL 256-Bit Encrypted Connection</span>
            </div>
          </div>
        </div>

        {/* Dynamic Display Panel Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-zinc-200 border-t-brand-primary rounded-full animate-spin"></div>
              <p className="text-sm font-semibold tracking-wide text-zinc-500">Querying live database...</p>
            </div>
          ) : (
            <>
                         {/* TAB 1: ANALYTICS OVERVIEW */}
              {activeTab === 'overview' && (
                <OverviewTab 
                  stats={stats} 
                  orders={orders} 
                  setActiveTab={setActiveTab} 
                />
              )}

              {/* TAB 2: PRODUCT CATALOG */}
              {activeTab === 'products' && (
                <ProductsTab
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  availableCategories={availableCategories}
                  filteredProducts={filteredProducts}
                  totalProductsCount={totalProductsCount}
                  productsPage={productsPage}
                  setProductsPage={setProductsPage}
                  pageSize={pageSize}
                  openProductForm={openProductForm}
                  handleDuplicateProduct={handleDuplicateProduct}
                  handleDeleteProduct={handleDeleteProduct}
                />
              )}

              {/* TAB 3: ORDERS INDEX */}
              {activeTab === 'orders' && (
                <OrdersTab
                  orders={orders}
                  selectedOrder={selectedOrder}
                  setSelectedOrder={setSelectedOrder}
                  orderTimeline={orderTimeline}
                  setOrderTimeline={setOrderTimeline}
                  handleUpdateOrderStatus={handleUpdateOrderStatus}
                  handleUpdateOrderPayment={handleUpdateOrderPayment}
                />
              )}

              {/* TAB 4: BULK INVENTORY MANAGEMENT */}
              {activeTab === 'inventory' && (
                <InventoryTab
                  products={products}
                  selectedProductIds={selectedProductIds}
                  setSelectedProductIds={setSelectedProductIds}
                  bulkStockAdd={bulkStockAdd}
                  setBulkStockAdd={setBulkStockAdd}
                  handleBulkStockUpdate={handleBulkStockUpdate}
                />
              )}

              {/* TAB 5: CUSTOMERS DIRECTORY */}
              {activeTab === 'customers' && (
                <CustomersTab
                  users={users}
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                  orders={orders}
                  handleToggleUserActive={handleToggleUserActive}
                />
              )}

              {/* TAB 6: COUPON ENGINE */}
              {activeTab === 'coupons' && (
                <CouponsTab
                  coupons={coupons}
                  setCoupons={setCoupons}
                  setEditingCoupon={setEditingCoupon}
                  setCouponModalOpen={setCouponModalOpen}
                />
              )}

              {/* TAB 7: HOMEPAGE CUSTOMIZATION */}
              {activeTab === 'homepage' && (
                <HomepageTab
                  banners={banners}
                  setBanners={setBanners}
                  homepageConfig={homepageConfig}
                  setHomepageConfig={setHomepageConfig}
                  openBannerForm={openBannerForm}
                  handleDeleteBanner={handleDeleteBanner}
                  settingsId={settings.id}
                />
              )}

              {/* TAB 8: BLOG MANAGEMENT */}
              {activeTab === 'blogs' && (
                <BlogsTab blogs={blogs} />
              )}

              {/* TAB 9: REVIEWS MODERATION BOARD */}
              {activeTab === 'reviews' && (
                <ReviewsTab
                  reviews={reviews}
                  setReviews={setReviews}
                />
              )}

              {/* TAB 10: GLOBAL STORE CONFIGURATIONS */}
              {activeTab === 'settings' && (
                <SettingsTab
                  settings={settings}
                  setSettings={setSettings}
                  permissions={permissions}
                  setPermissions={setPermissions}
                  handleSaveSettings={handleSaveSettings}
                />
              )}

              {/* TAB 11: SYNCHRONIZATION MANAGER */}
              {activeTab === 'sync' && (
                <SyncTab
                  syncSources={syncSources}
                  activeSource={activeSource}
                  setActiveSource={setActiveSource}
                  syncing={syncing}
                  syncProgress={syncProgress}
                  syncPage={syncPage}
                  syncLastPage={syncLastPage}
                  syncStats={syncStats}
                  syncLogs={syncLogs}
                  setSelectedLog={setSelectedLog}
                  runSync={runSync}
                />
              )}
            </>
          )}
        </div>

      </div>

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black tracking-tight text-zinc-900">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : "Create New Store SKU"}
              </h2>
              <button 
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              
              {/* Image upload choice */}
              <div className="space-y-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Product Images Acquisition</span>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setImageInputMethod('url')}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                      imageInputMethod === 'url' ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' : 'bg-white text-zinc-600 border-gray-200'
                    }`}
                  >
                    <Link className="w-4 h-4" />
                    External Image URL (Preferred)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setImageInputMethod('upload')}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                      imageInputMethod === 'upload' ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' : 'bg-white text-zinc-600 border-gray-200'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image to Supabase
                  </button>
                </div>

                {imageInputMethod === 'url' ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Paste product picture URL (e.g., https://images.unsplash.com/...)"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="bg-brand-primary text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      Add Image
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <input 
                      type="file" 
                      id="admin-file-upload" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const dummyUrl = URL.createObjectURL(file);
                          setProductForm({
                            ...productForm,
                            images: [...(productForm.images || []), dummyUrl]
                          });
                          alert(`Simulated file upload: ${file.name} uploaded successfully!`);
                        }
                      }}
                    />
                    <label htmlFor="admin-file-upload" className="cursor-pointer space-y-1 block">
                      <Upload className="w-8 h-8 text-gray-300 mx-auto" />
                      <p className="text-xs font-bold text-brand-primary">Click to select files or drag-and-drop</p>
                      <p className="text-[10px] text-gray-400">Supports WebP, AVIF, PNG, JPG. Optimized automatically.</p>
                    </label>
                  </div>
                )}

                {/* Images Preview list */}
                {productForm.images && productForm.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {productForm.images.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img src={url || undefined} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setProductForm({
                            ...productForm,
                            images: productForm.images?.filter((_, i) => i !== idx) || []
                          })}
                          className="absolute top-1 right-1 bg-black/60 p-0.5 rounded-full text-white hover:bg-black"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Core Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold text-zinc-700">
                <div className="md:col-span-2 space-y-1">
                  <label>Product Name</label>
                  <input 
                    type="text" 
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Signature Golden Jaal Jacquard Panjabi"
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label>SKU (Store Keeping Unit)</label>
                  <input 
                    type="text" 
                    value={productForm.sku || ''}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label>Price (৳)</label>
                  <input 
                    type="number" 
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label>Discount price (৳) (Optional)</label>
                  <input 
                    type="number" 
                    value={productForm.discountPrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: parseInt(e.target.value) || undefined })}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label>Gender classification</label>
                  <select 
                    value={productForm.gender}
                    onChange={(e) => setProductForm({ ...productForm, gender: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary cursor-pointer"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Couple">Couple Collection</option>
                    <option value="Kids">Kids</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label>Category</label>
                  <select 
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                  >
                    <option value="Panjabi">Panjabi</option>
                    <option value="Saree">Saree</option>
                    <option value="Shirts">Shirts</option>
                    <option value="Couple Collection">Couple Collection</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label>Sub-Category</label>
                  <input 
                    type="text" 
                    value={productForm.subCategory || ''}
                    onChange={(e) => setProductForm({ ...productForm, subCategory: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label>Status</label>
                  <select 
                    value={productForm.status || 'published'}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label>Inventory stock level</label>
                  <input 
                    type="number" 
                    value={productForm.stock || 0}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label>Safety Alert Threshold</label>
                  <input 
                    type="number" 
                    value={productForm.lowStockWarning || 5}
                    onChange={(e) => setProductForm({ ...productForm, lowStockWarning: parseInt(e.target.value) || 5 })}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label>Material composition</label>
                  <input 
                    type="text" 
                    value={productForm.material || ''}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              {/* Descriptions & Rich Details */}
              <div className="space-y-4">
                <div className="space-y-1 text-xs font-semibold">
                  <label>Short Description (SEO-friendly snippet)</label>
                  <input 
                    type="text" 
                    value={productForm.shortDescription || ''}
                    onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs font-semibold">
                  <label>Full Product Description (Rich Text/Markdown supported)</label>
                  <textarea 
                    rows={4}
                    value={productForm.description || ''}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Dynamic properties lists: tags, features, colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                
                {/* tags editing */}
                <div className="space-y-2">
                  <label>Add Search tags</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Traditional, Jacquard"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
                    />
                    <button 
                      type="button" 
                      onClick={addTag}
                      className="bg-zinc-800 text-white px-3 py-2 rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {productForm.tags?.map(t => (
                      <span key={t} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                        {t}
                        <button type="button" onClick={() => removeTag(t)} className="text-gray-400 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* color specifications adding */}
                <div className="space-y-2">
                  <label>Color Swatch Specifications</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Color Name"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
                    />
                    <input 
                      type="color" 
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-10 h-9 p-0 bg-transparent border-none cursor-pointer"
                    />
                    <button 
                      type="button" 
                      onClick={addColor}
                      className="bg-zinc-800 text-white px-3 py-2 rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {productForm.colors?.map((col, i) => (
                      <span key={i} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full border border-gray-200" style={{ backgroundColor: col.hex }}></span>
                        {col.name}
                        <button type="button" onClick={() => removeColor(i)} className="text-gray-400 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
                <button 
                  type="button" 
                  onClick={() => setProductModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-zinc-600 font-bold px-6 py-3 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-brand-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 transition-all cursor-pointer"
                >
                  {editingProduct ? "Save Changes" : "Create Product SKU"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: INSPECT SYNC LOG */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase">
                Inspect Sync Log: {selectedLog.source_id}
              </h2>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-700">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 font-semibold">
                <p><strong>Log ID:</strong> <span className="font-mono text-[10px] text-gray-500">{selectedLog.id}</span></p>
                <p><strong>Status:</strong> <span className="uppercase font-extrabold text-[#ff5c00]">{selectedLog.status}</span></p>
                <p><strong>Started At:</strong> {selectedLog.started_at}</p>
                <p><strong>Completed At:</strong> {selectedLog.completed_at || 'Incomplete / Aborted'}</p>
                <p><strong>Items Fetched:</strong> {selectedLog.items_fetched ?? 0}</p>
                <p><strong>Items Imported (New):</strong> {selectedLog.items_imported ?? 0}</p>
                <p><strong>Items Updated (Existing):</strong> {selectedLog.items_updated ?? 0}</p>
                <p><strong>Items Failed:</strong> {selectedLog.items_failed ?? 0}</p>
              </div>

              {selectedLog.error_message && (
                <div className="space-y-1 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-800">
                  <h4 className="font-bold uppercase text-[10px] text-red-500">Error Exception</h4>
                  <p className="font-mono break-all leading-relaxed">{selectedLog.error_message}</p>
                </div>
              )}

              {selectedLog.details && (
                <div className="space-y-1">
                  <h4 className="font-bold uppercase text-[10px] text-gray-400">Payload Execution Details</h4>
                  <pre className="bg-zinc-900 text-green-400 p-4 rounded-2xl max-h-48 overflow-y-auto text-[10px] font-mono leading-relaxed">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                onClick={() => setSelectedLog(null)}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer"
              >
                Close Inspect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: HERO BANNER EDIT FORM */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase">
                {editingBanner ? 'Edit Banner Slide' : 'Create Banner Slide'}
              </h2>
              <button 
                onClick={() => setBannerModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="uppercase font-bold text-gray-400">Slide Title</label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="e.g. EID UL ADHA FESTIVAL COLLECTION"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-zinc-800 font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase font-bold text-gray-400">Subtitle / Highlight Text</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="e.g. Royal Jacquard Panjabi"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-zinc-800 font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="uppercase font-bold text-gray-400">Upload Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageUpload}
                    disabled={uploadingBannerImage}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-zinc-800 font-medium focus:outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#ff5c00]/10 file:text-[#ff5c00] hover:file:bg-[#ff5c00]/20 file:cursor-pointer"
                  />
                  {uploadingBannerImage && <p className="text-[10px] text-[#ff5c00] font-bold animate-pulse">Uploading image to Supabase...</p>}
                </div>

                <div className="space-y-1">
                  <label className="uppercase font-bold text-gray-400">Image URL (or Auto-filled on Upload)</label>
                  <input
                    type="text"
                    required
                    value={bannerForm.image}
                    onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                    placeholder="Paste banner image URL link or upload above"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-zinc-800 font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="uppercase font-bold text-gray-400">CTA Button Text</label>
                  <input
                    type="text"
                    value={bannerForm.cta_text}
                    onChange={(e) => setBannerForm({ ...bannerForm, cta_text: e.target.value })}
                    placeholder="e.g. SHOP NOW"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-zinc-800 font-medium focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="uppercase font-bold text-gray-400">Target Category Link</label>
                  <input
                    type="text"
                    value={bannerForm.category}
                    onChange={(e) => setBannerForm({ ...bannerForm, category: e.target.value })}
                    placeholder="e.g. Panjabi"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-zinc-800 font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="uppercase font-bold text-gray-400">Banner Type</label>
                  <select
                    value={bannerForm.type}
                    onChange={(e) => setBannerForm({ ...bannerForm, type: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-zinc-800 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="homepage">Homepage Hero Slide</option>
                    <option value="promo">Promotional Banner</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="uppercase font-bold text-gray-400">Publish Date (Optional)</label>
                  <input
                    type="date"
                    value={bannerForm.publish_date}
                    onChange={(e) => setBannerForm({ ...bannerForm, publish_date: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-zinc-800 font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="bannerIsActive"
                  checked={bannerForm.is_active}
                  onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-primary accent-brand-primary focus:ring-0 cursor-pointer"
                />
                <label htmlFor="bannerIsActive" className="text-xs text-zinc-700 font-bold cursor-pointer">
                  Publish Slide Instantly (Online)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-zinc-600 font-bold px-6 py-3 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#ff5c00] text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-600 transition-all cursor-pointer"
                >
                  {editingBanner ? "Save Slide" : "Create Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
