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

  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Modal / Form States
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [couponModalOpen, setCouponModalOpen] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [bannerModalOpen, setBannerModalOpen] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

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

  // Fetch all tables on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: pData } = await supabase.from('products').select('*');
      const { data: oData } = await supabase.from('orders').select('*');
      const { data: cData } = await supabase.from('coupons').select('*');
      const { data: bData } = await supabase.from('banners').select('*');
      const { data: blData } = await supabase.from('blogs').select('*');
      const { data: rData } = await supabase.from('reviews').select('*');
      const { data: uData } = await supabase.from('users').select('*');
      const { data: sData } = await supabase.from('settings').select('*').single();

      if (pData) setProducts(pData);
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
      
      if (sourcesData) setSyncSources(sourcesData); else setSyncSources(sourcesFallback);
      if (logsData) setSyncLogs(logsData); else setSyncLogs(logsFallback);

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
      
      const { error } = await supabase.from('settings').update(payload).eq('id', 1);
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
          sub_category: p.subCategory || '',
          tags: p.tags || [],
          gender: p.gender || 'Men',
          price: Number(p.discountPrice || p.price || 0),
          discount_price: p.discountPrice ? Number(p.price) : null,
          purchase_price: Number(p.price) * 0.75, // mock cost
          rating: Number(p.rating || 5.0),
          reviews_count: Number(p.reviewsCount || 0),
          images: p.images || [],
          colors: p.colors || [],
          sizes: p.sizes || [],
          description: p.description || '',
          short_description: p.shortDescription || '',
          features: p.features || [],
          stock: p.stock || 50,
          low_stock_warning: p.lowStockWarning || 5,
          weight: p.weight || 0.35,
          material: p.material || 'Premium Quality Blend',
          status: p.status || 'published',
          is_featured: p.isFeatured || false,
          is_trending: p.isTrending || false,
          is_new: p.isNew || false,
          is_best_seller: p.isBestSeller || false,
          is_flash_sale: p.isFlashSale || false,
          source_id: 'mohasagor',
          source_product_id: p.id,
          created_at: new Date().toISOString()
        }));
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
        
        // Call serverless Sync API
        const response = await fetch(`/api/sync?source=${targetSource}&page=${currentPage}`);
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
      const { data: pData } = await supabase.from('products').select('*');
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

  // Dynamically extract categories from all loaded products
  const dynamicCategories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // Filter products matching search and categories
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
              onClick={() => { setActiveTab('banners'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'banners' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Banners & Promos</span>
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
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-black tracking-tight">Analytics Dashboard</h1>
                      <p className="text-sm text-gray-500">Realtime operations metrics aggregated from cloud sessions.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-xs font-bold font-mono">Today, Jul 05, 2026</span>
                    </div>
                  </div>

                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Stat Card 1: Sales */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50/50 rounded-full translate-x-8 -translate-y-8"></div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Sales (৳)</span>
                      <h3 className="text-3xl font-black tracking-tight mt-2 text-brand-primary">
                        ৳{stats.totalSales.toLocaleString('en-IN')}
                      </h3>
                      <div className="flex items-center mt-3 text-xs text-green-600 font-bold">
                        <span>+14.8% from yesterday</span>
                      </div>
                    </div>

                    {/* Stat Card 2: Orders */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Orders</span>
                      <h3 className="text-3xl font-black tracking-tight mt-2 text-zinc-950">
                        {orders.length}
                      </h3>
                      <div className="flex items-center mt-3 text-xs text-green-600 font-bold">
                        <span>+2 new orders today</span>
                      </div>
                    </div>

                    {/* Stat Card 3: Conversion Rate */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store Conversion</span>
                      <h3 className="text-3xl font-black tracking-tight mt-2 text-indigo-600 font-mono">
                        {stats.conversionRate}%
                      </h3>
                      <div className="flex items-center mt-3 text-xs text-zinc-500 font-medium">
                        <span>Avg visitor value: ৳1,450</span>
                      </div>
                    </div>

                    {/* Stat Card 4: Visitors */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store Traffic</span>
                      <h3 className="text-3xl font-black tracking-tight mt-2 text-brand-accent">
                        {stats.visitorsCount.toLocaleString()}
                      </h3>
                      <div className="flex items-center mt-3 text-xs text-emerald-600 font-bold">
                        <span>+120 active sessions</span>
                      </div>
                    </div>

                  </div>

                  {/* Low Stock Banner Quick Alert */}
                  {stats.lowStockCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="text-xs font-bold text-amber-800">Critical: Low Stock Warning Active!</p>
                          <p className="text-[11px] text-amber-700">{stats.lowStockCount} products are below the designated safety threshold. Replenish immediately.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('inventory')}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all"
                      >
                        Adjust Levels
                      </button>
                    </div>
                  )}

                  {/* Main Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Sales trend chart */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs lg:col-span-2">
                      <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-6">Sales Trend & Site Visits</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salesChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Sales" stroke="#1E3A8A" strokeWidth={3} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Visitors" stroke="#D4AF37" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Top categories distribution */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                      <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-6">Share by Product Category</h3>
                      <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {categoryPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-500 mt-4">
                        {categoryPieData.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                            <span className="truncate">{item.name} ({item.value}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Bottom Stats: Traffic & Third Party Integrations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Traffic source */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                      <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">Traffic Channel Performance</h3>
                      <div className="space-y-4">
                        {trafficSourceData.map((item, index) => (
                          <div key={index} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span>{item.name}</span>
                              <span className="text-brand-primary">{item.value}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-brand-primary h-full rounded-full" style={{ width: `${item.value}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ad integrations / Pixels */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-2">Ad Tracking & Telemetry</h3>
                        <p className="text-xs text-gray-400">Manage tags and analytic pixels for social marketing.</p>
                        
                        <div className="space-y-3 mt-4">
                          <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              <span className="text-xs font-bold">Google Analytics 4 (GA4)</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Connected</span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              <span className="text-xs font-bold">Meta Pixel (Facebook Ads)</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">10284812841</span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-zinc-400 rounded-full"></span>
                              <span className="text-xs font-bold text-gray-400">TikTok Pixel</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Disabled</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-semibold">Future Ready API Nodes:</span>
                        <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[10px]">Active</span>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: PRODUCT CATALOG */}
              {activeTab === 'products' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Products Inventory</h1>
                      <p className="text-xs text-gray-500">Dynamically add, edit, duplicate, and configure store SKUs.</p>
                    </div>
                    <button
                      onClick={() => openProductForm(null)}
                      className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-900 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-72">
                      <Search className="w-4 h-4 text-gray-400 mr-2" />
                      <input 
                        type="text" 
                        placeholder="Search product, category, ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none text-xs focus:ring-0 w-full outline-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <div>
                        <select 
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
                        >
                          {dynamicCategories.map(cat => (
                            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
                        >
                          <option value="All">All Statuses</option>
                          <option value="published">Published Only</option>
                          <option value="draft">Drafts Only</option>
                          <option value="archived">Archived Only</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Products Grid / Table */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                            <th className="p-4 w-12">Preview</th>
                            <th className="p-4">SKU / Product Info</th>
                            <th className="p-4">Category</th>
                            <th className="p-4 text-right">Price</th>
                            <th className="p-4 text-center">Stock</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs">
                          {filteredProducts.map((p) => {
                            const isLowStock = p.stock <= (p.lowStockWarning || 5);
                            return (
                              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                  <img 
                                    src={p.images[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=200'} 
                                    alt={p.name}
                                    className="w-10 h-12 object-cover rounded-md"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      // Image fallback simulation
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=200';
                                    }}
                                  />
                                </td>
                                <td className="p-4">
                                  <div className="font-bold text-zinc-900 leading-tight">{p.name}</div>
                                  <div className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-wider">
                                    SKU: {p.sku || `RUP-${p.id.toUpperCase()}`}
                                  </div>
                                </td>
                                <td className="p-4 font-semibold text-gray-500 uppercase text-[10px]">{p.category}</td>
                                <td className="p-4 text-right font-bold text-zinc-950">
                                  {p.discountPrice ? (
                                    <div className="flex flex-col items-end">
                                      <span className="text-brand-primary">৳{p.discountPrice.toLocaleString('en-IN')}</span>
                                      <span className="text-[10px] text-gray-400 line-through">৳{p.price.toLocaleString('en-IN')}</span>
                                    </div>
                                  ) : (
                                    <span>৳{p.price.toLocaleString('en-IN')}</span>
                                  )}
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`px-2 py-0.5 rounded font-bold ${
                                    isLowStock 
                                      ? 'bg-red-50 text-red-600 border border-red-100' 
                                      : 'bg-green-50 text-green-700 border border-green-100'
                                  }`}>
                                    {p.stock} units
                                  </span>
                                </td>
                                <td className="p-4 text-center uppercase text-[9px] font-bold">
                                  <span className={`px-2 py-1 rounded-full ${
                                    p.status === 'published' || !p.status
                                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                      : p.status === 'draft'
                                      ? 'bg-gray-100 text-gray-600'
                                      : 'bg-red-50 text-red-600'
                                  }`}>
                                    {p.status || 'published'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button 
                                      onClick={() => openProductForm(p)}
                                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-primary"
                                      title="Edit Product Details"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDuplicateProduct(p)}
                                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600"
                                      title="Duplicate SKU"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteProduct(p.id)}
                                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500"
                                      title="Delete Product Permanently"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ORDERS INDEX */}
              {activeTab === 'orders' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Orders Registry</h1>
                      <p className="text-xs text-gray-500">Configure order fulfillment workflow states and print customer invoices.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Orders List Index */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">All Transactions ({orders.length})</span>
                      </div>
                      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                        {orders.map((o) => (
                          <div 
                            key={o.id} 
                            onClick={() => {
                              setSelectedOrder(o);
                              setOrderTimeline([
                                `Order placed successfully at ${o.createdAt}`,
                                `Customer requested ${o.paymentMethod}`,
                                `Shipping area detected as ${o.area}`
                              ]);
                            }}
                            className={`p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-blue-50/20 ${
                              selectedOrder?.id === o.id ? 'bg-blue-50/50 border-l-4 border-brand-primary' : ''
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="font-bold text-sm text-brand-primary font-mono">{o.id}</span>
                                <span className="text-xs font-semibold text-zinc-600">{o.customerName}</span>
                                {o.isIncognitoGuest ? (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-md">
                                    🕶️ Incognito Guest
                                  </span>
                                ) : o.isGuest ? (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded-md">
                                    🕶️ Guest
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded-md">
                                    👤 Member
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400">{o.createdAt} • {o.items.length} items</p>
                            </div>
                            
                            <div className="flex items-center space-x-3 text-right">
                              <div>
                                <span className="text-xs font-bold text-zinc-950">৳{o.total.toLocaleString()}</span>
                                <div className="text-[10px] font-mono text-zinc-400">{o.paymentMethod}</div>
                              </div>
                              
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                o.status === 'Delivered' 
                                  ? 'bg-green-50 text-green-700' 
                                  : o.status === 'Cancelled'
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-amber-50 text-amber-700 animate-pulse'
                              }`}>
                                {o.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details Panel */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                      {selectedOrder ? (
                        <div className="space-y-6">
                          <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                            <div>
                              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-400">Order Information</h3>
                              <span className="text-lg font-black tracking-tight text-brand-primary font-mono mt-1 block">{selectedOrder.id}</span>
                            </div>
                            
                            {/* Print Invoice simulation */}
                            <button 
                              onClick={() => {
                                const w = window.open('', '_blank');
                                if (w) {
                                  w.document.write(`
                                    <html>
                                      <head>
                                        <title>Invoice ${selectedOrder.id}</title>
                                        <style>
                                          body { font-family: sans-serif; padding: 40px; color: #222; }
                                          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1E3A8A; padding-bottom: 20px; }
                                          .details { margin: 30px 0; display: flex; justify-content: space-between; }
                                          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                          th, td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
                                          th { background: #f8f9fa; }
                                          .total { text-align: right; margin-top: 30px; font-size: 1.2em; font-weight: bold; }
                                        </style>
                                      </head>
                                      <body>
                                        <div class="header">
                                          <div>
                                            <h1>RUPAN.</h1>
                                            <p>Style That Speaks.</p>
                                          </div>
                                          <div>
                                            <h2>INVOICE</h2>
                                            <p>Order Reference: ${selectedOrder.id}</p>
                                            <p>Date: ${selectedOrder.createdAt}</p>
                                          </div>
                                        </div>
                                        <div class="details">
                                          <div>
                                            <h3>Billed To:</h3>
                                            <p>${selectedOrder.customerName}</p>
                                            <p>${selectedOrder.phone}</p>
                                            <p>${selectedOrder.address}</p>
                                          </div>
                                          <div>
                                            <h3>Payment details:</h3>
                                            <p>Method: ${selectedOrder.paymentMethod}</p>
                                            <p>Area: ${selectedOrder.area}</p>
                                          </div>
                                        </div>
                                        <table>
                                          <thead>
                                            <tr>
                                              <th>Product name</th>
                                              <th>Color / Size</th>
                                              <th>Qty</th>
                                              <th>Unit price</th>
                                              <th>Total</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            ${selectedOrder.items.map(item => `
                                              <tr>
                                                <td>${item.productName}</td>
                                                <td>${item.color} / ${item.size}</td>
                                                <td>${item.quantity}</td>
                                                <td>৳${item.price}</td>
                                                <td>৳${item.price * item.quantity}</td>
                                              </tr>
                                            `).join('')}
                                          </tbody>
                                        </table>
                                        <div class="total">
                                          <p>Subtotal: ৳${selectedOrder.subtotal}</p>
                                          <p>Shipping fee: ৳${selectedOrder.shippingFee}</p>
                                          <p>Grand Total: ৳${selectedOrder.total}</p>
                                        </div>
                                      </body>
                                    </html>
                                  `);
                                  w.document.close();
                                  w.print();
                                }
                              }}
                              className="text-gray-400 hover:text-brand-primary p-2 rounded-lg hover:bg-gray-50 flex items-center gap-1 cursor-pointer text-xs font-bold"
                              title="Print Invoice"
                            >
                              <FileDown className="w-4 h-4" />
                              <span>PDF</span>
                            </button>
                          </div>

                          <div className="space-y-4">
                            
                            {/* Workflow selector */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase text-gray-400">Order Fulfillment Status</label>
                              <select 
                                value={selectedOrder.status}
                                onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as any)}
                                className="w-full bg-gray-50 border border-gray-200 text-xs font-bold py-2.5 rounded-xl px-3 outline-none focus:border-brand-primary cursor-pointer"
                              >
                                <option value="Pending">Pending Validation</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing / Fabric Cut</option>
                                <option value="Packed">Packed & Ready</option>
                                <option value="Shipped">Shipped / Dispatched</option>
                                <option value="Delivered">Delivered (Completed)</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Returned">Returned</option>
                              </select>
                            </div>

                            {/* Payment Status selector */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase text-gray-400">Payment Status</label>
                              <select 
                                value={selectedOrder.paymentStatus || 'Unpaid'}
                                onChange={(e) => handleUpdateOrderPayment(selectedOrder.id, e.target.value as any)}
                                className="w-full bg-gray-50 border border-gray-200 text-xs font-bold py-2.5 rounded-xl px-3 outline-none focus:border-brand-primary cursor-pointer"
                              >
                                <option value="Unpaid">Unpaid / COD Balance Due</option>
                                <option value="Paid">Paid / Confirmed bKash</option>
                                <option value="Refunded">Refunded / Returned</option>
                              </select>
                            </div>

                             {/* Customer information */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100 text-xs">
                              <div>
                                <span className="text-gray-400">Customer:</span>
                                <strong className="float-right text-zinc-900">{selectedOrder.customerName}</strong>
                              </div>
                              <div>
                                <span className="text-gray-400">Order Origin:</span>
                                <strong className="float-right">
                                  {selectedOrder.isIncognitoGuest ? (
                                    <span className="text-orange-600">🕶️ Incognito Guest</span>
                                  ) : selectedOrder.isGuest ? (
                                    <span className="text-zinc-600">🕶️ Guest</span>
                                  ) : (
                                    <span className="text-blue-600">👤 Registered Member</span>
                                  )}
                                </strong>
                              </div>
                              <div>
                                <span className="text-gray-400">Phone:</span>
                                <strong className="float-right text-zinc-900">{selectedOrder.phone}</strong>
                              </div>
                              <div className="border-t border-gray-200 pt-2 mt-1">
                                <span className="text-gray-400">Shipping destination:</span>
                                <p className="font-semibold text-zinc-700 mt-1 leading-normal">{selectedOrder.address}</p>
                              </div>
                            </div>

                            {/* Customer notes */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase text-gray-400">Special Delivery Notes</span>
                              <p className="text-xs italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 text-amber-900">
                                {selectedOrder.customerNotes || "No custom delivery notes specified."}
                              </p>
                            </div>

                            {/* Order Timeline Logs */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase text-gray-400">Timeline / Audit Logs</span>
                              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                                {orderTimeline.map((log, idx) => (
                                  <div key={idx} className="flex gap-2 text-[10px] leading-relaxed text-gray-500">
                                    <span className="text-brand-accent font-bold">•</span>
                                    <span>{log}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-12">
                          <ListOrdered className="w-12 h-12 stroke-1 mb-3" />
                          <p className="text-xs font-semibold">Select an order from the list registry to configure fulfillment statuses, view notes, and print standard PDF receipts.</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 4: BULK INVENTORY MANAGEMENT */}
              {activeTab === 'inventory' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Bulk Stock Control</h1>
                      <p className="text-xs text-gray-500">Quickly inspect stock thresholds, monitor alerts, and execute batch adjustments.</p>
                    </div>
                  </div>

                  {/* Bulk Stock Adjustment Tool */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-6 items-end justify-between">
                    <div className="space-y-2 flex-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Batch adjustment parameters</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-600">Stock modification amount</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 10 to add, -5 to subtract"
                            value={bulkStockAdd || ''}
                            onChange={(e) => setBulkStockAdd(parseInt(e.target.value) || 0)}
                            className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-zinc-500 leading-normal">
                            This will add/subtract stock from the <strong>{selectedProductIds.length}</strong> selected products.
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleBulkStockUpdate}
                      disabled={selectedProductIds.length === 0}
                      className="bg-brand-primary disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-blue-900 transition-all cursor-pointer"
                    >
                      Apply Batch Change
                    </button>
                  </div>

                  {/* Inventory levels table */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            if (selectedProductIds.length === products.length) {
                              setSelectedProductIds([]);
                            } else {
                              setSelectedProductIds(products.map(p => p.id));
                            }
                          }}
                          className="text-xs text-brand-primary font-bold hover:underline cursor-pointer"
                        >
                          Toggle Selection ({selectedProductIds.length})
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                            <th className="p-4 w-12 text-center">Select</th>
                            <th className="p-4">SKU Code</th>
                            <th className="p-4">Product Name</th>
                            <th className="p-4 text-center">Current Stock</th>
                            <th className="p-4 text-center">Safety Limit</th>
                            <th className="p-4">Level Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs">
                          {products.map((p) => {
                            const isSelected = selectedProductIds.includes(p.id);
                            const isLowStock = p.stock <= (p.lowStockWarning || 5);
                            return (
                              <tr key={p.id} className={`hover:bg-gray-50/50 ${isSelected ? 'bg-blue-50/20' : ''}`}>
                                <td className="p-4 text-center">
                                  <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedProductIds([...selectedProductIds, p.id]);
                                      } else {
                                        setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                                      }
                                    }}
                                    className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                                  />
                                </td>
                                <td className="p-4 font-mono font-bold uppercase text-[10px] text-gray-500">{p.sku || `RUP-${p.id.toUpperCase()}`}</td>
                                <td className="p-4 font-bold text-zinc-900">{p.name}</td>
                                <td className="p-4 text-center font-bold">
                                  <span className={isLowStock ? 'text-red-600 font-black' : 'text-zinc-800'}>
                                    {p.stock}
                                  </span>
                                </td>
                                <td className="p-4 text-center text-gray-400 font-semibold">{p.lowStockWarning || 5} units</td>
                                <td className="p-4">
                                  {isLowStock ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                                      <AlertTriangle className="w-3 h-3" />
                                      CRITICAL STOCK
                                    </span>
                                  ) : p.stock === 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-500 bg-gray-100 px-2 py-0.5 rounded">
                                      SOLD OUT
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded">
                                      ADEQUATE LEVEL
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CUSTOMERS DIRECTORY */}
              {activeTab === 'customers' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Customer Directory</h1>
                      <p className="text-xs text-gray-500">Monitor consumer accounts, evaluate buying behaviors, and manage profile restrictions.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Customer Registry List */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Registrants Index</span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {users.map((u) => (
                          <div 
                            key={u.id}
                            onClick={() => setSelectedCustomer(u)}
                            className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/30 ${
                              selectedCustomer?.id === u.id ? 'bg-blue-50/40 border-l-4 border-brand-primary' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-zinc-600">
                                {u.fullName[0].toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-zinc-950">{u.fullName}</h4>
                                <p className="text-[10px] text-gray-400 font-semibold">{u.email} • {u.role}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <span className="text-xs font-bold text-zinc-950">৳{u.totalSpending.toLocaleString()}</span>
                                <div className="text-[9px] text-gray-400">Total Spent</div>
                              </div>
                              
                              <span className={`w-2.5 h-2.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Profile detail */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                      {selectedCustomer ? (
                        <div className="space-y-6">
                          <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
                            <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center font-bold text-3xl text-brand-primary mb-3">
                              {selectedCustomer.fullName[0].toUpperCase()}
                            </div>
                            <h3 className="font-black text-lg text-zinc-900">{selectedCustomer.fullName}</h3>
                            <p className="text-xs text-zinc-500">{selectedCustomer.email}</p>
                            
                            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent mt-2 block font-mono bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                              {selectedCustomer.role}
                            </span>
                          </div>

                          <div className="space-y-4">
                            
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                <span className="text-[9px] text-gray-400 uppercase font-bold block">Lifetime Value</span>
                                <span className="text-sm font-black text-brand-primary font-mono mt-1 block">৳{selectedCustomer.totalSpending.toLocaleString()}</span>
                              </div>

                              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                <span className="text-[9px] text-gray-400 uppercase font-bold block">Registration</span>
                                <span className="text-xs font-bold text-zinc-800 mt-1 block font-mono">{selectedCustomer.createdAt}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase text-gray-400">Buying History Synopsis</span>
                              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Total Placed Orders:</span>
                                  <strong className="text-zinc-800">
                                    {orders.filter(o => o.customerName === selectedCustomer.fullName).length}
                                  </strong>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Last login:</span>
                                  <strong className="text-zinc-800 font-mono text-[10px]">
                                    {selectedCustomer.lastLogin || 'No record'}
                                  </strong>
                                </div>
                              </div>
                            </div>

                            {/* Account Restrictions toggling */}
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                              <div>
                                <h4 className="text-xs font-bold">Restrict Session Access</h4>
                                <p className="text-[10px] text-gray-400">Toggle customer login capabilities.</p>
                              </div>
                              <button
                                onClick={() => handleToggleUserActive(selectedCustomer)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer ${
                                  selectedCustomer.isActive 
                                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200' 
                                    : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
                                }`}
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>{selectedCustomer.isActive ? 'Ban Account' : 'Lift Ban'}</span>
                              </button>
                            </div>

                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-12">
                          <Users className="w-12 h-12 stroke-1 mb-3" />
                          <p className="text-xs font-semibold">Select a customer node from the list directory to access order summaries, profile metrics, and account status toggles.</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 6: COUPON ENGINE */}
              {activeTab === 'coupons' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Coupon Engine</h1>
                      <p className="text-xs text-gray-500">Add percentage cuts, flat waivers, and shipping exclusions dynamically.</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCoupon(null);
                        setCouponModalOpen(true);
                      }}
                      className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-900 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Coupon</span>
                    </button>
                  </div>

                  {/* Coupons list */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                            <th className="p-4">Coupon Code</th>
                            <th className="p-4">Discount Scheme</th>
                            <th className="p-4 text-center">Minimum Purchase</th>
                            <th className="p-4 text-center">Limit Status</th>
                            <th className="p-4 text-center">Expiration Date</th>
                            <th className="p-4 text-right">Fulfillment Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs">
                          {coupons.map((c) => (
                            <tr key={c.code} className="hover:bg-gray-50/50">
                              <td className="p-4">
                                <div className="font-mono font-black text-sm text-brand-primary tracking-wider uppercase bg-blue-50 border border-blue-100 rounded px-2 py-0.5 w-fit">
                                  {c.code}
                                </div>
                              </td>
                              <td className="p-4 font-bold text-zinc-900">
                                {c.type === 'percentage' ? `${c.value}% Off Basket` : `৳${c.value} Flat Waiver`}
                              </td>
                              <td className="p-4 text-center font-semibold text-gray-500">৳{c.minOrder}</td>
                              <td className="p-4 text-center">
                                <span className="font-semibold text-zinc-600">
                                  {c.usedCount || 0} / {c.usageLimit || '∞'} uses
                                </span>
                              </td>
                              <td className="p-4 text-center font-mono text-gray-400 font-semibold">{c.expiryDate}</td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={async () => {
                                    const updated = coupons.map(cop => cop.code === c.code ? { ...cop, isActive: !cop.isActive } : cop);
                                    await supabase.from('coupons').update({ isActive: !c.isActive }).eq('code', c.code);
                                    setCoupons(updated);
                                  }}
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all ${
                                    c.isActive 
                                      ? 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200' 
                                      : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                                  }`}
                                >
                                  {c.isActive ? 'Active' : 'Disabled'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: BANNERS & PROMOS */}
              {activeTab === 'banners' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Banners & Promotions</h1>
                      <p className="text-xs text-gray-500">Create, edit, and schedule homepage sliders, category banners, or promotional popups.</p>
                    </div>
                  </div>

                  {/* Banners Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((b) => (
                      <div key={b.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs relative flex flex-col justify-between">
                        <div>
                          <div className="relative h-44 bg-zinc-950 overflow-hidden">
                            <img 
                              src={b.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600'} 
                              alt={b.title} 
                              className="w-full h-full object-cover opacity-75"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-3 left-3 bg-brand-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                              {b.type}
                            </span>
                          </div>
                          
                          <div className="p-4 space-y-2">
                            <h4 className="font-bold text-sm text-zinc-950 leading-snug">{b.title}</h4>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed">{b.subtitle}</p>
                          </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                          <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">
                            Published {b.publishDate || 'Immediate'}
                          </span>
                          
                          <button
                            onClick={async () => {
                              const updated = banners.map(bn => bn.id === b.id ? { ...bn, isActive: !bn.isActive } : bn);
                              await supabase.from('banners').update({ isActive: !b.isActive }).eq('id', b.id);
                              setBanners(updated);
                            }}
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                              b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {b.isActive ? 'Online' : 'Offline'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: BLOG MANAGEMENT */}
              {activeTab === 'blogs' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Editorial & Blog Posts</h1>
                      <p className="text-xs text-gray-500">Edit, structure, and publish rich content articles to increase site SEO and organic visibility.</p>
                    </div>
                  </div>

                  {/* Blogs list */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                            <th className="p-4">Featured Image</th>
                            <th className="p-4">Title & Excerpt</th>
                            <th className="p-4 text-center">Read Time</th>
                            <th className="p-4 text-center">Category</th>
                            <th className="p-4 text-right">Workflow Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs">
                          {blogs.map((b) => (
                            <tr key={b.id} className="hover:bg-gray-50/50">
                              <td className="p-4">
                                <img src={b.image || undefined} alt={b.title} className="w-16 h-12 object-cover rounded-md" referrerPolicy="no-referrer" />
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-zinc-950 leading-tight">{b.title}</div>
                                <p className="text-xs text-zinc-400 mt-1 truncate max-w-sm">{b.excerpt}</p>
                              </td>
                              <td className="p-4 text-center font-semibold text-gray-500">{b.readTime || '4 min read'}</td>
                              <td className="p-4 text-center uppercase text-[9px] font-bold text-brand-primary bg-blue-50/50 rounded-full px-2 py-0.5 w-fit mx-auto mt-4">
                                {b.category || 'Fashion'}
                              </td>
                              <td className="p-4 text-right">
                                <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-bold uppercase text-[9px] border border-green-100">
                                  {b.status || 'published'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: REVIEWS MODERATION BOARD */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Customer Reviews Board</h1>
                      <p className="text-xs text-gray-500">Moderate product review submittals, reply to consumer queries, and approve verified badges.</p>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-gray-50/30 transition-colors">
                        <div className="flex gap-4">
                          <img 
                            src={r.userPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150'} 
                            alt={r.userName} 
                            className="w-10 h-10 rounded-full object-cover shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-sm text-zinc-950">{r.userName}</h4>
                              <span className="text-[10px] font-mono text-gray-400">{r.date}</span>
                              {r.verified && (
                                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-100">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            
                            <div className="flex text-amber-400 text-xs">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i}>{i < r.rating ? '★' : '☆'}</span>
                              ))}
                            </div>
                            
                            <p className="text-xs text-zinc-600 leading-relaxed max-w-2xl">{r.comment}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0 self-end md:self-start">
                          <button 
                            onClick={async () => {
                              const updated = reviews.map(rev => rev.id === r.id ? { ...rev, status: 'approved' as const } : rev);
                              await supabase.from('reviews').update({ status: 'approved' }).eq('id', r.id);
                              setReviews(updated);
                              alert("Review approved for publication on the storefront!");
                            }}
                            className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-100 hover:bg-green-100 transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                          
                          <button 
                            onClick={async () => {
                              const updated = reviews.filter(rev => rev.id !== r.id);
                              await supabase.from('reviews').delete().eq('id', r.id);
                              setReviews(updated);
                              alert("Review deleted successfully.");
                            }}
                            className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-100 hover:bg-red-100 transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 10: GLOBAL STORE CONFIGURATIONS */}
              {activeTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Global Configurations</h1>
                      <p className="text-xs text-gray-500">Calibrate branding layouts, shipping logistics tiers, support channels, and payment settings.</p>
                    </div>
                    <button
                      onClick={handleSaveSettings}
                      className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-900 transition-all cursor-pointer shadow-md"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Configs</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Visual & Logo Setup Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <Image className="w-4 h-4 text-brand-primary" />
                        Branding Parameters
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-600">Logo text</label>
                          <input 
                            type="text" 
                            value={settings.logoText}
                            onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                            className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-600">Logo Accent character</label>
                          <input 
                            type="text" 
                            value={settings.logoAccent}
                            onChange={(e) => setSettings({ ...settings, logoAccent: e.target.value })}
                            className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-600">Tagline slogan</label>
                        <input 
                          type="text" 
                          value={settings.tagline}
                          onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                          className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Customer Support channels */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-500" />
                        Customer Service Channels
                      </h3>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-600">Official WhatsApp (International format)</label>
                        <input 
                          type="text" 
                          value={settings.whatsappNumber}
                          onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                          className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-600">Customer Support Hotline</label>
                        <input 
                          type="text" 
                          value={settings.supportNumber}
                          onChange={(e) => setSettings({ ...settings, supportNumber: e.target.value })}
                          className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Shipping logistics setup */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-brand-accent" />
                        Logistics & Shipping Fees
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-600">Inside Dhaka (৳)</label>
                          <input 
                            type="number" 
                            value={settings.insideDhakaShipping}
                            onChange={(e) => setSettings({ ...settings, insideDhakaShipping: parseInt(e.target.value) || 0 })}
                            className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-600">Outside Dhaka (৳)</label>
                          <input 
                            type="number" 
                            value={settings.outsideDhakaShipping}
                            onChange={(e) => setSettings({ ...settings, outsideDhakaShipping: parseInt(e.target.value) || 0 })}
                            className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-600">Free Shipping Limit Minimum Order (৳)</label>
                        <input 
                          type="number" 
                          value={settings.freeShippingMinOrder}
                          onChange={(e) => setSettings({ ...settings, freeShippingMinOrder: parseInt(e.target.value) || 0 })}
                          className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Roles Configuration */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-indigo-500" />
                        Interactive Staff Permissions
                      </h3>
                      
                      <div className="space-y-3">
                        <p className="text-[11px] text-gray-400">Manage fine-tuned permissions for store agents below.</p>
                        
                        <div className="grid grid-cols-2 gap-3.5 text-xs font-semibold">
                          <label className="flex items-center space-x-2.5">
                            <input 
                              type="checkbox" 
                              checked={permissions.products} 
                              onChange={(e) => setPermissions({ ...permissions, products: e.target.checked })}
                              className="rounded border-gray-300 text-brand-primary" 
                            />
                            <span>Edit products SKU</span>
                          </label>

                          <label className="flex items-center space-x-2.5">
                            <input 
                              type="checkbox" 
                              checked={permissions.orders} 
                              onChange={(e) => setPermissions({ ...permissions, orders: e.target.checked })}
                              className="rounded border-gray-300 text-brand-primary" 
                            />
                            <span>Fulfill Order states</span>
                          </label>

                          <label className="flex items-center space-x-2.5">
                            <input 
                              type="checkbox" 
                              checked={permissions.coupons} 
                              onChange={(e) => setPermissions({ ...permissions, coupons: e.target.checked })}
                              className="rounded border-gray-300 text-brand-primary" 
                            />
                            <span>Manage Coupon pools</span>
                          </label>

                          <label className="flex items-center space-x-2.5">
                            <input 
                              type="checkbox" 
                              checked={permissions.settings} 
                              onChange={(e) => setPermissions({ ...permissions, settings: e.target.checked })}
                              className="rounded border-gray-300 text-brand-primary" 
                            />
                            <span>Update server setting</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Marketing Ad Integrations Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 col-span-1 lg:col-span-2">
                      <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#ff5c00]" />
                        Marketing Telemetry & Ad Integrations
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-600">Meta Pixel (Facebook Ads) ID</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 10284812841"
                            value={settings.metaPixelId || ''}
                            onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value })}
                            className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-600">Meta Test Event Code</label>
                          <input 
                            type="text" 
                            placeholder="e.g. TEST12345 (for monitoring live test events)"
                            value={settings.metaTestEventCode || ''}
                            onChange={(e) => setSettings({ ...settings, metaTestEventCode: e.target.value })}
                            className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-600">Google Tag Manager (GTM) ID</label>
                          <input 
                            type="text" 
                            placeholder="e.g. GTM-XXXXXX"
                            value={settings.googleTagManagerId || ''}
                            onChange={(e) => setSettings({ ...settings, googleTagManagerId: e.target.value })}
                            className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-600">Google Analytics 4 (GA4) Measurement ID</label>
                          <input 
                            type="text" 
                            placeholder="e.g. G-XXXXXXXXXX"
                            value={settings.googleAnalyticsId || ''}
                            onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                            className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === 'sync' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Synchronization Manager</h1>
                      <p className="text-xs text-gray-500">Import and sync product directories from third-party wholesale APIs and reseller configurations.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sync Sources Panel */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 lg:col-span-1">
                      <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <Link className="w-4 h-4 text-brand-primary" />
                        Connected Sources
                      </h3>

                      <div className="space-y-3">
                        {syncSources.map((source) => (
                          <div 
                            key={source.id}
                            onClick={() => !syncing && setActiveSource(source.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${
                              activeSource === source.id 
                                ? 'bg-orange-50/50 border-[#ff5c00] text-[#ff5c00]' 
                                : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100/50'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black uppercase tracking-wider">{source.name}</span>
                              <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                source.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                              }`}>
                                {source.is_active ? 'Active' : 'Disabled'}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 truncate">{source.api_url || 'Manual Entry source'}</p>
                            <div className="flex justify-between items-center mt-3 text-[9px] text-gray-400 font-semibold">
                              <span>Markup: +{source.config?.markup_percentage || 0}%</span>
                              <span>Sync: {source.last_sync_at ? String(source.last_sync_at).substring(0, 10) : 'Never'}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Sync Controls */}
                      <div className="pt-4 border-t border-gray-100 space-y-4">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                          <span className="text-[9px] font-extrabold uppercase text-gray-400 block">Active Source Specs</span>
                          {syncSources.find(s => s.id === activeSource) ? (
                            <div className="text-xs space-y-1 font-semibold text-gray-700">
                              <p>Type: <span className="text-gray-500 uppercase">{syncSources.find(s => s.id === activeSource).type}</span></p>
                              <p>Auto Publish: <span className="text-gray-500">{syncSources.find(s => s.id === activeSource).config?.auto_publish !== false ? 'Yes' : 'No'}</span></p>
                              <p className="break-all">Target URL: <span className="text-gray-500 font-mono text-[10px] block mt-0.5">{syncSources.find(s => s.id === activeSource).api_url}</span></p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">No source selected.</p>
                          )}
                        </div>

                        <button
                          onClick={runSync}
                          disabled={syncing}
                          className="w-full bg-[#ff5c00] hover:bg-orange-600 disabled:bg-orange-800/50 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center space-x-2 hover:shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                          <span>{syncing ? 'Syncing...' : 'Trigger Sync Now'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Sync Logs and Progress Panel */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 lg:col-span-2">
                      <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                        Sync Telemetry & Logs
                      </h3>

                      {/* Real-time Progress Bar */}
                      {syncing && (
                        <div className="p-5 bg-gradient-to-br from-orange-50/60 via-white to-amber-50/40 border border-orange-100 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-2xs">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-3.5 h-3.5 text-[#ff5c00] animate-spin" />
                              <span className="font-extrabold text-orange-600 uppercase tracking-wider text-[10px]">Syncing Mohasagor API...</span>
                            </div>
                            <span className="font-extrabold text-orange-600 font-mono text-[11px] bg-orange-100 px-2 py-0.5 rounded-full">{syncProgress}%</span>
                          </div>
                          
                          {/* Sleek animated line progress bar */}
                          <div className="w-full bg-orange-100 h-2.5 rounded-full overflow-hidden relative">
                            <div 
                              className="bg-gradient-to-r from-orange-500 via-[#ff5c00] to-amber-500 h-full transition-all duration-300 rounded-full relative"
                              style={{ width: `${syncProgress}%` }}
                            >
                              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[pulse_1.5s_infinite]"></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-[10px] text-orange-600/80 font-medium">
                            <span>Processing Page {syncPage} of {syncLastPage}</span>
                            <span className="font-mono">{syncStats.fetched.toLocaleString()} Items Fetched</span>
                          </div>

                          {/* Live Statistics Cards Grid */}
                          <div className="grid grid-cols-3 gap-2.5 pt-1">
                            <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-2.5 text-center">
                              <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider block">Imported</span>
                              <span className="text-sm font-black text-emerald-700 font-mono">{syncStats.imported}</span>
                            </div>
                            <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-2.5 text-center">
                              <span className="text-[9px] uppercase font-bold text-blue-600 tracking-wider block">Updated</span>
                              <span className="text-sm font-black text-blue-700 font-mono">{syncStats.updated}</span>
                            </div>
                            <div className="bg-red-50/50 border border-red-100/50 rounded-xl p-2.5 text-center">
                              <span className="text-[9px] uppercase font-bold text-red-600 tracking-wider block">Failed</span>
                              <span className="text-sm font-black text-red-700 font-mono">{syncStats.failed}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Logs Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-600 border-collapse">
                          <thead>
                            <tr className="border-b border-gray-100 font-bold uppercase text-[10px] text-gray-400">
                              <th className="py-3">Started</th>
                              <th className="py-3">Source</th>
                              <th className="py-3">Status</th>
                              <th className="py-3 text-center">Fetched</th>
                              <th className="py-3 text-center">Upserted</th>
                              <th className="py-3 text-center">Failed</th>
                              <th className="py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {syncLogs.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-400 italic">No sync logs found.</td>
                              </tr>
                            ) : (
                              syncLogs.map((log) => (
                                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                                  <td className="py-3 font-medium">{log.started_at ? String(log.started_at).substring(0, 16) : 'N/A'}</td>
                                  <td className="py-3 font-semibold uppercase">{log.source_id}</td>
                                  <td className="py-3">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                      log.status === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
                                      log.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-100' :
                                      'bg-blue-50 text-blue-700 border border-blue-100 animate-pulse'
                                    }`}>
                                      {log.status}
                                    </span>
                                  </td>
                                  <td className="py-3 text-center font-mono">{log.items_fetched ?? 0}</td>
                                  <td className="py-3 text-center font-mono text-emerald-600 font-semibold">
                                    {Number(log.items_imported ?? 0) + Number(log.items_updated ?? 0)}
                                  </td>
                                  <td className="py-3 text-center font-mono text-red-500 font-semibold">{log.items_failed ?? 0}</td>
                                  <td className="py-3 text-right">
                                    <button 
                                      onClick={() => setSelectedLog(log)}
                                      className="text-[#ff5c00] hover:underline font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                                    >
                                      Inspect
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
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

    </div>
  );
}
