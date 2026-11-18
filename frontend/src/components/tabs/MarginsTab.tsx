import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Percent, Coins, Save, Search, RefreshCw, AlertCircle, 
  CheckCircle2, Sparkles, SlidersHorizontal, Info, Check, X, Database,
  ShieldCheck, Calculator, ArrowRight, Layers, Tag
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateFullSimulatedCatalog } from '../../utils/mockCatalogGenerator';

interface MarginsTabProps {
  products: any[];
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  dbSettings: any;
  setDbSettings: (settings: any) => void;
  isSupabaseOnline: boolean;
}

export default function MarginsTab({
  products,
  setProducts,
  dbSettings,
  setDbSettings,
  isSupabaseOnline
}: MarginsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'category' | 'product'>('category');

  // Full catalog state to display all products rather than just single page
  const [catalogProducts, setCatalogProducts] = useState<any[]>(products);
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(false);

  // Source filter & pagination states
  const [sourceFilter, setSourceFilter] = useState<'all' | 'mohasagor' | 'manual'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 50;

  // Global Calculation Parameters (MOHASAGOR Pricing Logic)
  const [deductionPercentage, setDeductionPercentage] = useState<number>(25); // Default 25%
  const [resellerDeliveryCost, setResellerDeliveryCost] = useState<number>(120); // Default 120 BDT per product
  const [defaultMarginType, setDefaultMarginType] = useState<'percentage' | 'fixed'>('percentage');
  const [defaultMarginValue, setDefaultMarginValue] = useState<number>(10); // Default 10%
  const [categoryMargins, setCategoryMargins] = useState<Record<string, { type: 'percentage' | 'fixed'; value: number } | number>>({});
  const [discountCombinationRule, setDiscountCombinationRule] = useState<'stack' | 'max'>('stack');
  const [onlineDiscountEnabled, setOnlineDiscountEnabled] = useState<boolean>(true);
  const [onlineDiscountPercent, setOnlineDiscountPercent] = useState<number>(50);
  const [savingCategory, setSavingCategory] = useState<boolean>(false);
  
  // Interactive Simulator Sandbox State
  const [simMSRP, setSimMSRP] = useState<number>(1000);
  const [simCost, setSimCost] = useState<number>(600);
  const [simTestDiscount, setSimTestDiscount] = useState<number>(150);

  // Notification toast state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    text: string;
  } | null>(null);

  // Auto-dismiss notification after 8 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Product margins states (Single product editing)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingMSRP, setEditingMSRP] = useState<string>('');
  const [editingCost, setEditingCost] = useState<string>('');
  const [editingDeductionPct, setEditingDeductionPct] = useState<number>(25);
  const [editingMarginType, setEditingMarginType] = useState<'percentage' | 'fixed'>('percentage');
  const [editingMarginVal, setEditingMarginVal] = useState<string>('10');
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [savingProduct, setSavingProduct] = useState<boolean>(false);

  // Fetch complete product catalog from Supabase
  const fetchFullCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      if (!isSupabaseOnline) {
        const stored = localStorage.getItem('rup_db_products');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCatalogProducts(parsed);
              return;
            }
          } catch (_) {}
        }
        const generated = generateFullSimulatedCatalog(2747);
        setCatalogProducts(generated);
        return;
      }

      let all: any[] = [];
      let page = 0;
      const pageSize = 500;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data || data.length === 0) {
          hasMore = false;
        } else {
          all = all.concat(data);
          if (data.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      if (all.length > 0) {
        setCatalogProducts(all);
      }
    } catch (e) {
      console.warn("Failed to fetch full catalog in MarginsTab:", e);
    } finally {
      setLoadingCatalog(false);
    }
  }, [isSupabaseOnline]);

  useEffect(() => {
    fetchFullCatalog();
  }, [fetchFullCatalog]);

  // Keep synced if parent products changes and catalog is still smaller
  useEffect(() => {
    if (products.length > 0 && catalogProducts.length === 0) {
      setCatalogProducts(products);
    }
  }, [products]);

  // Initialize parameters from dbSettings or local storage backup
  useEffect(() => {
    let settingsToUse = dbSettings;
    if (!settingsToUse) {
      try {
        const raw = localStorage.getItem('rup_db_settings');
        if (raw) settingsToUse = JSON.parse(raw);
      } catch (_) {}
    }
    if (settingsToUse) {
      const pConfig = settingsToUse.pricing_config || settingsToUse.pricingConfig || {};
      const hConfig = settingsToUse.homepageConfig || settingsToUse.homepage_config || {};

      const rawDeduction = pConfig.deduction_percentage ?? pConfig.deductionPercentage;
      setDeductionPercentage(rawDeduction !== undefined ? Number(rawDeduction) : 25);
      const rawResellerCost = pConfig.reseller_delivery_cost ?? pConfig.resellerDeliveryCost;
      setResellerDeliveryCost(rawResellerCost !== undefined ? Number(rawResellerCost) : 120);
      setDefaultMarginType(pConfig.default_margin_type || pConfig.defaultMarginType || 'percentage');
      const rawMarginVal = pConfig.default_margin_value ?? pConfig.defaultMarginValue ?? hConfig.default_margin;
      setDefaultMarginValue(rawMarginVal !== undefined ? Number(rawMarginVal) : 10);
      setDiscountCombinationRule(pConfig.discount_combination_rule || pConfig.discountCombinationRule || 'stack');
      setCategoryMargins(pConfig.category_margins || hConfig.category_margins || {
        "men's fashion": { type: 'percentage', value: 10 },
        "women's fashion": { type: 'percentage', value: 10 },
        "couple collection": { type: 'percentage', value: 10 },
        "kids zone": { type: 'percentage', value: 15 },
        "watch": { type: 'percentage', value: 15 }
      });

      if (settingsToUse.online_payment_discount_enabled !== undefined || settingsToUse.onlinePaymentDiscountEnabled !== undefined) {
        setOnlineDiscountEnabled((settingsToUse.online_payment_discount_enabled ?? settingsToUse.onlinePaymentDiscountEnabled) !== false);
      }
      if (settingsToUse.online_payment_discount_percent !== undefined || settingsToUse.onlinePaymentDiscountPercent !== undefined) {
        setOnlineDiscountPercent(Number(settingsToUse.online_payment_discount_percent ?? settingsToUse.onlinePaymentDiscountPercent ?? 50));
      }
    }
  }, [dbSettings]);

  // Dynamic Categories list
  const categoriesList = useMemo(() => {
    return Array.from(
      new Set([
        "men's fashion",
        "women's fashion",
        "couple collection",
        "kids zone",
        "watch",
        ...catalogProducts.map(p => (p.category || '').trim().toLowerCase()).filter(Boolean)
      ])
    ).map(catKey => ({
      id: catKey,
      name: catKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }));
  }, [catalogProducts]);

  // Catalog telemetry stats
  const productsWithCost = catalogProducts.filter(p => Number(p.purchasePrice || p.purchase_price || 0) > 0);
  const productsWithoutCost = catalogProducts.length - productsWithCost.length;

  /**
   * Helper to compute formula values for any product
   */
  const calculatePricingForProduct = useCallback((msrp: number, cost: number, catId: string = '') => {
    // Step 1: Calculate Price Difference X
    const diffX = Math.max(0, msrp - cost);

    // Step 2: Website Final Price = MSRP - (Deduction% * X)
    const deductionFactor = (deductionPercentage || 25) / 100;
    const finalPrice = Math.round(msrp - deductionFactor * diffX);

    // Step 3: Margin
    let mType: 'percentage' | 'fixed' = defaultMarginType;
    let mVal: number = defaultMarginValue;

    if (catId && categoryMargins[catId] !== undefined) {
      const setting = categoryMargins[catId];
      if (typeof setting === 'object' && setting !== null) {
        mType = setting.type || defaultMarginType;
        mVal = Number(setting.value || 0);
      } else {
        mType = 'percentage';
        mVal = Number(setting);
      }
    }

    let marginAmount = 0;
    if (mType === 'fixed') {
      marginAmount = mVal;
    } else {
      marginAmount = Math.round(finalPrice * (mVal / 100));
    }

    const sellingPrice = finalPrice + marginAmount;

    return {
      diffX,
      finalPrice,
      marginType: mType,
      marginVal: mVal,
      marginAmount,
      sellingPrice
    };
  }, [deductionPercentage, defaultMarginType, defaultMarginValue, categoryMargins]);

  // Interactive Simulator Computed Values
  const simResults = useMemo(() => {
    const calc = calculatePricingForProduct(simMSRP, simCost);
    const maxDiscountAllowed = Math.max(0, calc.sellingPrice - calc.finalPrice);
    const effectiveDiscount = Math.min(simTestDiscount, maxDiscountAllowed);
    const payableAmount = calc.sellingPrice - effectiveDiscount;
    const isFloorProtected = simTestDiscount > maxDiscountAllowed;

    return {
      ...calc,
      maxDiscountAllowed,
      effectiveDiscount,
      payableAmount,
      isFloorProtected
    };
  }, [simMSRP, simCost, simTestDiscount, calculatePricingForProduct]);

  /**
   * 1. SAVE GLOBAL PRICING & BATCH RECALCULATE ALL PRODUCTS
   */
  const handleSaveCategoryMargins = async () => {
    setSavingCategory(true);
    setNotification(null);

    try {
      const updatedPricingConfig = {
        deduction_percentage: deductionPercentage,
        deductionPercentage: deductionPercentage,
        reseller_delivery_cost: resellerDeliveryCost,
        resellerDeliveryCost: resellerDeliveryCost,
        default_margin_type: defaultMarginType,
        defaultMarginType: defaultMarginType,
        default_margin_value: defaultMarginValue,
        defaultMarginValue: defaultMarginValue,
        category_margins: categoryMargins,
        discount_combination_rule: discountCombinationRule,
        online_payment_discount_enabled: onlineDiscountEnabled,
        online_payment_discount_percent: onlineDiscountPercent,
        minimum_price_protection_enabled: true
      };

      // 1. Persist updated configuration to settings table
      try {
        const { data: existingSettings } = await supabase.from('settings').select('id, homepage_config').limit(1).maybeSingle();
        const existingHp = existingSettings?.homepage_config || {};
        const mergedHp = {
          ...existingHp,
          default_margin: defaultMarginValue,
          category_margins: categoryMargins
        };

        const updatePayload: any = {
          pricing_config: updatedPricingConfig,
          homepage_config: mergedHp,
          online_payment_discount_enabled: onlineDiscountEnabled,
          online_payment_discount_percent: onlineDiscountPercent
        };

        if (existingSettings?.id) {
          await supabase.from('settings').update(updatePayload).eq('id', existingSettings.id);
        } else {
          await supabase.from('settings').upsert([{ id: 1, ...updatePayload }]);
        }
      } catch (settingsErr) {
        console.warn("Settings update warn:", settingsErr);
      }

      // Also persist to localStorage backup
      try {
        const cached = JSON.parse(localStorage.getItem('rup_db_settings') || '{}');
        cached.pricing_config = updatedPricingConfig;
        cached.pricingConfig = updatedPricingConfig;
        cached.online_payment_discount_enabled = onlineDiscountEnabled;
        cached.onlinePaymentDiscountEnabled = onlineDiscountEnabled;
        cached.online_payment_discount_percent = onlineDiscountPercent;
        cached.onlinePaymentDiscountPercent = onlineDiscountPercent;
        localStorage.setItem('rup_db_settings', JSON.stringify(cached));
      } catch (_) {}

      setDbSettings({
        ...(dbSettings || {}),
        pricing_config: updatedPricingConfig,
        pricingConfig: updatedPricingConfig,
        online_payment_discount_enabled: onlineDiscountEnabled,
        onlinePaymentDiscountEnabled: onlineDiscountEnabled,
        online_payment_discount_percent: onlineDiscountPercent,
        onlinePaymentDiscountPercent: onlineDiscountPercent
      });

      // 2. Fetch all products from database
      let allDbProducts: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: pageData, error: pageErr } = await supabase
          .from('products')
          .select('id, name, category, price, discount_price, purchase_price, final_price')
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (pageErr || !pageData || pageData.length === 0) {
          hasMore = false;
        } else {
          allDbProducts = allDbProducts.concat(pageData);
          if (pageData.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      if (allDbProducts.length === 0 && products.length > 0) {
        allDbProducts = [...products];
      }

      const updates: { id: string; price: number; discount_price: number | null; purchase_price: number; final_price: number }[] = [];
      let updatedCount = 0;
      let skippedCount = 0;

      for (const p of allDbProducts) {
        const cost = Number(p.purchasePrice || p.purchase_price || 0);
        const regularMSRP = Number(p.price || 0);

        if (cost <= 0 && regularMSRP <= 0) {
          skippedCount++;
          continue;
        }

        // If product doesn't have cost recorded, estimate cost at 75% of regular MSRP
        const effectiveCost = cost > 0 ? cost : Math.round(regularMSRP * 0.75);
        const effectiveMSRP = regularMSRP > 0 ? regularMSRP : Math.round(effectiveCost * 1.35);

        const catId = (p.category || '').toLowerCase().trim();
        const calc = calculatePricingForProduct(effectiveMSRP, effectiveCost, catId);

        let newPrice = calc.sellingPrice;
        let newDiscountPrice: number | null = null;

        // If original MSRP is higher than calculated selling price, display MSRP with strikethrough
        if (effectiveMSRP > calc.sellingPrice) {
          newPrice = effectiveMSRP;
          newDiscountPrice = calc.sellingPrice;
        } else {
          newPrice = calc.sellingPrice;
          newDiscountPrice = null;
        }

        updates.push({
          id: p.id,
          price: newPrice,
          discount_price: newDiscountPrice,
          purchase_price: effectiveCost,
          final_price: calc.finalPrice
        });
      }

      // 3. Batch update products in Supabase in chunks of 50
      if (updates.length > 0) {
        const chunkSize = 50;
        for (let i = 0; i < updates.length; i += chunkSize) {
          const chunk = updates.slice(i, i + chunkSize);
          await Promise.all(
            chunk.map(u =>
              supabase
                .from('products')
                .update({ 
                  price: u.price, 
                  discount_price: u.discount_price,
                  purchase_price: u.purchase_price,
                  final_price: u.final_price
                })
                .eq('id', u.id)
            )
          );
        }

        updatedCount = updates.length;

        // 4. Update in-memory local state
        const updatedMap = new Map(updates.map(u => [u.id, u]));
        const updateProductObject = (p: any) => {
          const u = updatedMap.get(p.id);
          if (u) {
            return {
              ...p,
              price: u.price,
              discountPrice: u.discount_price,
              discount_price: u.discount_price,
              purchasePrice: u.purchase_price,
              purchase_price: u.purchase_price,
              finalPrice: u.final_price,
              final_price: u.final_price
            };
          }
          return p;
        };

        const updatedLocalProducts = products.map(updateProductObject);
        setProducts(updatedLocalProducts);

        const updatedCatalog = catalogProducts.map(updateProductObject);
        setCatalogProducts(updatedCatalog);

        // 5. Persist to localStorage and dispatch event for instant website sync
        try {
          localStorage.setItem('rup_db_products', JSON.stringify(updatedLocalProducts));
          window.dispatchEvent(new CustomEvent('rupan:products_updated', { detail: updatedLocalProducts }));
        } catch (_) {}
      }

      setNotification({
        type: 'success',
        title: 'প্রাইসিং ও মার্জিন সফলভাবে কার্যকর হয়েছে!',
        text: `মোট ${updatedCount} টি পণ্যের ফাইনাল প্রাইস (Final Price) এবং বিক্রয় মূল্য (Selling Price) নতুন ফর্মুলা অনুযায়ী হালনাগাদ করা হয়েছে।` + 
          (skippedCount > 0 ? ` (${skippedCount} টি পণ্যে কোনো তথ্য না থাকায় বাদ দেওয়া হয়েছে)` : '')
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      console.error(err);
      setNotification({
        type: 'error',
        title: 'আপডেট ব্যর্থ হয়েছে',
        text: `মার্জিন সংরক্ষণ করা সম্ভব হয়নি: ${err.message}`
      });
    } finally {
      setSavingCategory(false);
    }
  };

  /**
   * 2. INDIVIDUAL PRODUCT EDITING WITH TWO-WAY REACTIVE CALCULATION
   */
  const handleStartEdit = (product: any) => {
    const cost = Number(product.purchasePrice || product.purchase_price || 0);
    const sell = Number(product.discountPrice || product.discount_price || product.price || 0);
    const msrp = Number(product.price || sell);

    setEditingProductId(product.id);
    setEditingMSRP(msrp > 0 ? String(msrp) : '');
    setEditingCost(cost > 0 ? String(cost) : '');
    setEditingDeductionPct(deductionPercentage || 25);
    setEditingMarginType(defaultMarginType || 'percentage');

    const diff = Math.max(0, msrp - cost);
    const finalP = Math.round(msrp - ((deductionPercentage || 25) / 100) * diff);

    if (sell > finalP && finalP > 0) {
      if (defaultMarginType === 'fixed') {
        setEditingMarginVal(String(sell - finalP));
      } else {
        const mPct = Math.round(((sell - finalP) / finalP) * 100);
        setEditingMarginVal(String(mPct));
      }
    } else {
      setEditingMarginVal(String(defaultMarginValue || 10));
    }

    setEditingPrice(sell > 0 ? String(sell) : String(finalP));
  };

  // When MSRP changes
  const handleMSRPChange = (val: string) => {
    setEditingMSRP(val);
    const msrp = Number(val);
    const cost = Number(editingCost);
    const mVal = Number(editingMarginVal);

    if (!isNaN(msrp) && msrp > 0) {
      const diff = Math.max(0, msrp - (isNaN(cost) ? 0 : cost));
      const finalP = Math.round(msrp - (editingDeductionPct / 100) * diff);
      const mAmount = editingMarginType === 'fixed' ? mVal : Math.round(finalP * (mVal / 100));
      setEditingPrice(String(finalP + mAmount));
    }
  };

  // When Cost changes
  const handleCostChange = (val: string) => {
    setEditingCost(val);
    const cost = Number(val);
    const msrp = Number(editingMSRP);
    const mVal = Number(editingMarginVal);

    if (!isNaN(cost) && cost >= 0 && !isNaN(msrp) && msrp > 0) {
      const diff = Math.max(0, msrp - cost);
      const finalP = Math.round(msrp - (editingDeductionPct / 100) * diff);
      const mAmount = editingMarginType === 'fixed' ? mVal : Math.round(finalP * (mVal / 100));
      setEditingPrice(String(finalP + mAmount));
    }
  };

  // When Margin Value or Type changes
  const handleMarginChange = (val: string, type: 'percentage' | 'fixed' = editingMarginType) => {
    setEditingMarginVal(val);
    setEditingMarginType(type);
    const mVal = Number(val);
    const msrp = Number(editingMSRP);
    const cost = Number(editingCost);

    if (!isNaN(msrp) && msrp > 0) {
      const diff = Math.max(0, msrp - (isNaN(cost) ? 0 : cost));
      const finalP = Math.round(msrp - (editingDeductionPct / 100) * diff);
      const mAmount = type === 'fixed' ? mVal : Math.round(finalP * (mVal / 100));
      setEditingPrice(String(finalP + (isNaN(mAmount) ? 0 : mAmount)));
    }
  };

  // When Selling Price changes manually
  const handlePriceChange = (val: string) => {
    setEditingPrice(val);
    const sellP = Number(val);
    const msrp = Number(editingMSRP);
    const cost = Number(editingCost);

    if (!isNaN(sellP) && !isNaN(msrp) && msrp > 0) {
      const diff = Math.max(0, msrp - (isNaN(cost) ? 0 : cost));
      const finalP = Math.round(msrp - (editingDeductionPct / 100) * diff);

      if (sellP >= finalP && finalP > 0) {
        if (editingMarginType === 'fixed') {
          setEditingMarginVal(String(sellP - finalP));
        } else {
          const mPct = Math.round(((sellP - finalP) / finalP) * 100);
          setEditingMarginVal(String(mPct));
        }
      } else {
        setEditingMarginVal('0');
      }
    }
  };

  // Save Single Product Margin
  const handleSaveProductMargin = async (productId: string) => {
    setSavingProduct(true);
    try {
      const sellPrice = Number(editingPrice);
      const msrpPrice = Number(editingMSRP);
      const costPrice = Number(editingCost);

      if (isNaN(sellPrice) || sellPrice <= 0) {
        alert("দয়া করে সঠিক বিক্রয় মূল্য দিন (Please enter a valid selling price).");
        return;
      }

      const product = catalogProducts.find(p => p.id === productId);
      if (!product) return;

      const diff = Math.max(0, msrpPrice - costPrice);
      const finalPrice = Math.round(msrpPrice - (editingDeductionPct / 100) * diff);

      // Enforce Minimum Price Protection: Selling price cannot be below Final Price
      const validatedSellingPrice = Math.max(finalPrice, sellPrice);

      const updateData: any = {
        purchase_price: costPrice,
        final_price: finalPrice
      };

      if (msrpPrice > validatedSellingPrice) {
        updateData.price = msrpPrice;
        updateData.discount_price = validatedSellingPrice;
      } else {
        updateData.price = validatedSellingPrice;
        updateData.discount_price = null;
      }

      // 1. Update in Supabase
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);

      if (error) throw error;

      // 2. Update in-memory state
      const updateProductItem = (p: any) => {
        if (p.id === productId) {
          return {
            ...p,
            price: updateData.price,
            discountPrice: updateData.discount_price,
            discount_price: updateData.discount_price,
            purchasePrice: updateData.purchase_price,
            purchase_price: updateData.purchase_price,
            finalPrice: updateData.final_price,
            final_price: updateData.final_price
          };
        }
        return p;
      };

      const updatedProductsList = products.map(updateProductItem);
      setProducts(updatedProductsList);

      const updatedCatalog = catalogProducts.map(updateProductItem);
      setCatalogProducts(updatedCatalog);

      // 3. Save to localStorage for instant website sync
      try {
        localStorage.setItem('rup_db_products', JSON.stringify(updatedProductsList));
        window.dispatchEvent(new CustomEvent('rupan:products_updated', { detail: updatedProductsList }));
      } catch (_) {}

      setEditingProductId(null);

      setNotification({
        type: 'success',
        title: 'পণ্য সফলভাবে আপডেট হয়েছে!',
        text: `"${product.name}" পণ্যের নতুন বিক্রয় মূল্য ৳${validatedSellingPrice.toLocaleString()} (ফাইনাল ফ্লোর প্রাইস: ৳${finalPrice.toLocaleString()}) ওয়েবসাইটে কার্যকর হয়েছে।`
      });

    } catch (err: any) {
      console.error(err);
      setNotification({
        type: 'error',
        title: 'আপডেট ব্যর্থ হয়েছে',
        text: `পণ্য আপডেট করা যায়নি: ${err.message}`
      });
    } finally {
      setSavingProduct(false);
    }
  };

  // Filter products for the table
  const searchFilteredProducts = catalogProducts.filter(p => {
    const term = searchQuery.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(term) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.category || '').toLowerCase().includes(term)
    );
  });

  const mohasagorCount = searchFilteredProducts.filter(p => p.source_id === 'mohasagor').length;
  const manualCount = searchFilteredProducts.filter(p => p.source_id !== 'mohasagor').length;

  const sourceFilteredProducts = searchFilteredProducts.filter(p => {
    if (sourceFilter === 'mohasagor') return p.source_id === 'mohasagor';
    if (sourceFilter === 'manual') return p.source_id !== 'mohasagor';
    return true;
  });

  // Pagination
  const totalFiltered = sourceFilteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, totalFiltered);
  const filteredProducts = sourceFilteredProducts.slice(pageStart, pageEnd);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#ff5c00]" />
            MOHASAGOR Pricing & Custom Margin Manager
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            MOHASAGOR API-এর <code className="font-mono text-[#ff5c00] font-bold">sale_price</code> (ক্রয়মূল্য) ও <code className="font-mono text-gray-700 font-bold">price</code> (MSRP) ব্যবহার করে স্বয়ংক্রিয় প্রাইসিং, কাস্টম লাভ এবং সর্বনিম্ন মূল্য সুরক্ষা (Minimum Price Protection) নিয়ন্ত্রণ করুন।
          </p>
        </div>

        {/* Catalog Telemetry Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchFullCatalog}
            disabled={loadingCatalog}
            title="Reload entire product catalog from database"
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCatalog ? 'animate-spin' : ''}`} />
            <span>{loadingCatalog ? 'লোড হচ্ছে...' : 'ক্যাটালগ রিফ্রেশ'}</span>
          </button>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[9px] uppercase font-bold text-emerald-600 block">ক্রয়মূল্য সেট আছে (With Cost)</span>
            <span className="text-xs font-black text-emerald-700 font-mono">{productsWithCost.length} items</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[9px] uppercase font-bold text-amber-600 block">ক্রয়মূল্য সেট নেই (No Cost)</span>
            <span className="text-xs font-black text-amber-700 font-mono">{productsWithoutCost} items</span>
          </div>
        </div>
      </div>

      {/* Prominent Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : notification.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-start gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-black text-sm tracking-tight">{notification.title}</h4>
              <p className="text-xs mt-0.5 font-medium leading-relaxed opacity-90">{notification.text}</p>
            </div>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('category')}
          className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'category'
              ? 'border-[#ff5c00] text-[#ff5c00]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Pricing Formula & Margin Settings (মূল্য ও মার্জিন কনফিগারেশন)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('product')}
          className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'product'
              ? 'border-[#ff5c00] text-[#ff5c00]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Individual Product Pricing ({catalogProducts.length} Products)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: FORMULA, MARGINS & MULTI-DISCOUNT CONFIGURATION     */}
      {/* ============================================================== */}
      {activeSubTab === 'category' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Formula Parameters & Category Setup */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1 & 2: Formula Parameters */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#ff5c00]" />
                    Step 1 & 2: Price Difference & Website Final Price Formula
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    মহাসাগর পাইকারি ক্রয়মূল্য (<code className="font-mono text-gray-600">sale_price</code>) ও রিটেইল মূল্যের (<code className="font-mono text-gray-600">price</code>) ব্যবধানের উপর ভিত্তি করে Website Price (Final Price) নির্ধারিত হয়।
                  </p>
                </div>
              </div>

              {/* Reseller Delivery / Handling Cost Setting */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-blue-950 block">
                      Mohasagor Reseller Delivery Cost (সাপ্লায়ার পরিবহন/ডেলিভারি খরচ)
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
                      +৳{resellerDeliveryCost} / পণ্য
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    মহাসাগর থেকে প্রতিটি পণ্য আপনার কাছে আনতে পরিবহন/ডেলিভারি খরচ হিসেবে যে <strong>৳{resellerDeliveryCost}</strong> খরচ হয়, তা এখানে সেট করুন। সিঙ্ক এবং প্রাইসিং ক্যালকুলেশনে এটি স্বয়ংক্রিয়ভাবে ক্রয়মূল্য ও বিক্রয়মূল্যে যুক্ত হবে।
                  </span>
                </div>
                <div className="flex items-center gap-2 w-36 shrink-0">
                  <span className="text-sm font-black text-blue-600 font-mono">৳</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={resellerDeliveryCost}
                    onChange={(e) => setResellerDeliveryCost(Math.max(0, Number(e.target.value)))}
                    className="w-full text-right px-3 py-2 border border-blue-200 rounded-lg text-sm font-black outline-none focus:ring-1 focus:ring-blue-500 bg-white text-blue-950 font-mono"
                  />
                </div>
              </div>

              {/* Deduction Percentage Setting */}
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black uppercase text-gray-800 block">
                    Website Price Deduction Percentage (কর্তন হার)
                  </span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    বর্তমান সেটিং: <strong className="text-orange-900">{deductionPercentage}%</strong> — Retail Price ও Wholesale Cost-এর পার্থক্যের {deductionPercentage}% বাদ দিয়ে Final Price তৈরি হয়।
                  </span>
                </div>
                <div className="flex items-center gap-2 w-36 shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={deductionPercentage}
                    onChange={(e) => setDeductionPercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-full text-right px-3 py-2 border border-orange-200 rounded-lg text-sm font-black outline-none focus:ring-1 focus:ring-[#ff5c00] bg-white text-orange-950 font-mono"
                  />
                  <span className="text-sm font-black text-orange-600">%</span>
                </div>
              </div>

              {/* Mathematical Representation Card */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 font-mono text-[11px] space-y-1.5 text-gray-700">
                <div className="font-bold text-gray-900 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>সক্রিয় গাণিতিক ফর্মুলা (Active Mathematical Formula):</span>
                </div>
                <div className="pl-4 border-l-2 border-[#ff5c00] space-y-1">
                  <div>1. <span className="text-blue-700 font-bold">Landed Cost</span> = sale_price + ৳{resellerDeliveryCost} (সাপ্লায়ার ডেলিভারি খরচ)</div>
                  <div>2. <span className="text-blue-700 font-bold">X</span> = price (MSRP) - Landed Cost</div>
                  <div>3. <span className="text-emerald-700 font-bold">Final Price</span> = price - ({deductionPercentage}% × X)</div>
                  <div>4. <span className="text-[#ff5c00] font-bold">Selling Price</span> = Final Price + Margin</div>
                  <div>5. <span className="text-purple-700 font-bold">Final Payable</span> = max(Final Price, Discounted Selling Price)</div>
                </div>
              </div>
            </div>

            {/* Step 3: Profit Margin Settings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-emerald-600" />
                    Step 3: Profit Margin (মুনাফা নির্ধারণ)
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Website Final Price-এর উপর আপনার পছন্দমতো লাভ (শতাংশ % অথবা নির্দিষ্ট টাকা ৳) যোগ হয়ে বিক্রয় মূল্য তৈরি হবে।
                  </p>
                </div>
              </div>

              {/* Default Global Margin */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black uppercase text-emerald-950 block">
                    Default Global Profit Margin (ডিফল্ট সার্বিক লাভ)
                  </span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">
                    যেসব ক্যাটাগরির আলাদা মার্জিন নেই সেগুলোতে এই লাভ কার্যকর হবে।
                  </span>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {/* Type Selector Toggle */}
                  <div className="flex bg-white rounded-lg p-0.5 border border-emerald-200">
                    <button
                      type="button"
                      onClick={() => setDefaultMarginType('percentage')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                        defaultMarginType === 'percentage'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setDefaultMarginType('fixed')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                        defaultMarginType === 'fixed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      ৳ Flat
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 w-28">
                    <input
                      type="number"
                      min="0"
                      value={defaultMarginValue}
                      onChange={(e) => setDefaultMarginValue(Math.max(0, Number(e.target.value)))}
                      className="w-full text-right px-3 py-1.5 border border-emerald-300 rounded-lg text-xs font-black font-mono outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-emerald-950"
                    />
                    <span className="text-xs font-black text-emerald-700">
                      {defaultMarginType === 'percentage' ? '%' : '৳'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category-Specific Margins */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-black uppercase text-gray-900 tracking-wider block">
                  Category-Specific Margins (ক্যাটাগরি ভিত্তিক লাভ)
                </span>
                
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {categoriesList.map((cat) => {
                    const rawVal = categoryMargins[cat.id];
                    const catType: 'percentage' | 'fixed' = (typeof rawVal === 'object' && rawVal !== null) ? rawVal.type : defaultMarginType;
                    const catVal: number = (typeof rawVal === 'object' && rawVal !== null) ? rawVal.value : (rawVal !== undefined ? Number(rawVal) : defaultMarginValue);

                    return (
                      <div key={cat.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50/70 transition-colors">
                        <div>
                          <span className="text-xs font-bold text-gray-800 block">{cat.name}</span>
                          <span className="text-[10px] text-gray-400 capitalize">{cat.id}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Individual Category Type Selector */}
                          <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                            <button
                              type="button"
                              onClick={() => setCategoryMargins({
                                ...categoryMargins,
                                [cat.id]: { type: 'percentage', value: catVal }
                              })}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                                catType === 'percentage'
                                  ? 'bg-[#ff5c00] text-white shadow-xs'
                                  : 'text-gray-500 hover:text-gray-900'
                              }`}
                            >
                              %
                            </button>
                            <button
                              type="button"
                              onClick={() => setCategoryMargins({
                                ...categoryMargins,
                                [cat.id]: { type: 'fixed', value: catVal }
                              })}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                                catType === 'fixed'
                                  ? 'bg-[#ff5c00] text-white shadow-xs'
                                  : 'text-gray-500 hover:text-gray-900'
                              }`}
                            >
                              ৳
                            </button>
                          </div>

                          <div className="flex items-center gap-1 w-24">
                            <input
                              type="number"
                              min="0"
                              value={catVal}
                              onChange={(e) => setCategoryMargins({
                                ...categoryMargins,
                                [cat.id]: { type: catType, value: Math.max(0, Number(e.target.value)) }
                              })}
                              className="w-full text-right px-2.5 py-1 border border-gray-300 rounded-lg text-xs font-black font-mono outline-none focus:border-[#ff5c00] bg-white text-gray-900"
                            />
                            <span className="text-xs font-bold text-gray-500">{catType === 'percentage' ? '%' : '৳'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 4: Multi-Discount & Minimum Price Protection Rules */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Step 4: Multiple Discounts & Minimum Price Protection
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    অনলাইন পেমেন্ট ও কুপন ডিসকাউন্ট প্রয়োগের পরও গ্রাহকের প্রদেয় মূল্য কখনোই Website Final Price-এর নিচে নামতে পারবে না।
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Backend Enforced
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Online Payment Discount Control */}
                <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-blue-950 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onlineDiscountEnabled}
                        onChange={(e) => setOnlineDiscountEnabled(e.target.checked)}
                        className="rounded border-blue-300 text-blue-600 w-4 h-4"
                      />
                      <span>Online Payment Discount</span>
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 font-mono">{onlineDiscountPercent}% of margin</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={onlineDiscountPercent}
                      disabled={!onlineDiscountEnabled}
                      onChange={(e) => setOnlineDiscountPercent(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer disabled:opacity-40"
                    />
                  </div>
                  <p className="text-[10px] text-blue-700 leading-tight">
                    Bangla QR, bKash ও Nagad পেমেন্টে মার্জিনের উপর সর্বোচ্চ {onlineDiscountPercent}% পর্যন্ত ছাড় কার্যকর হবে।
                  </p>
                </div>

                {/* Discount Combination Rule */}
                <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/40 space-y-2">
                  <span className="text-xs font-black text-purple-950 block">Discount Combination Rule</span>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setDiscountCombinationRule('stack')}
                      className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all border text-left ${
                        discountCombinationRule === 'stack'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="block font-black">Stack Discounts</span>
                      <span className="opacity-80 font-normal">একসাথে প্রযোজ্য</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountCombinationRule('max')}
                      className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all border text-left ${
                        discountCombinationRule === 'max'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="block font-black">Single Best</span>
                      <span className="opacity-80 font-normal">সর্বোচ্চ একটি ছাড়</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-purple-700 leading-tight">
                    একাধিক ডিসকাউন্ট একসাথে প্রয়োগ হলেও Payable Amount = max(Final Price, Discounted Price)।
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] text-gray-500 font-medium block">
                    * সেভ করলে ওয়েবসাইটের সকল পণ্যের মূল্য ও মার্জিন স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে।
                  </span>
                  {notification && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                      notification.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {notification.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                      <span>{notification.title}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSaveCategoryMargins}
                  disabled={savingCategory}
                  className="bg-[#ff5c00] hover:bg-orange-600 disabled:bg-orange-800/50 text-white text-xs font-extrabold uppercase tracking-wider px-6 py-3.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 disabled:cursor-not-allowed shrink-0"
                >
                  {savingCategory ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{savingCategory ? 'Updating Website...' : 'Save & Recalculate Website (সংরক্ষণ করুন)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Col: Interactive Live Calculation Simulator */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5 sticky top-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#ff5c00]" />
                    Live Pricing Simulator
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    যেকোনো মান ইনপুট দিয়ে লাইভ হিসাব যাচাই করুন
                  </p>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                    MOHASAGOR Retail Price (MSRP / price)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={simMSRP}
                      onChange={(e) => setSimMSRP(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:border-[#ff5c00] bg-gray-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                    Wholesale Cost (sale_price / purchase_price)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={simCost}
                      onChange={(e) => setSimCost(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:border-[#ff5c00] bg-gray-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                    Test Customer Discount (কুপন বা অনলাইন ছাড়)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={simTestDiscount}
                      onChange={(e) => setSimTestDiscount(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:border-[#ff5c00] bg-gray-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Step-by-Step Breakdown Display */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-3 font-mono text-xs">
                
                {/* Step 1 */}
                <div className="flex justify-between items-center text-gray-600">
                  <span>Step 1: Difference (X)</span>
                  <span className="font-bold text-gray-900">৳{simResults.diffX.toLocaleString()}</span>
                </div>

                {/* Step 2 */}
                <div className="flex justify-between items-center text-emerald-700 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                  <div>
                    <span className="font-bold block">Step 2: Final Price (Floor)</span>
                    <span className="text-[9px] text-emerald-600">{simMSRP} - ({deductionPercentage}% × {simResults.diffX})</span>
                  </div>
                  <span className="font-black text-sm text-emerald-800">৳{simResults.finalPrice.toLocaleString()}</span>
                </div>

                {/* Step 3 */}
                <div className="flex justify-between items-center text-gray-600">
                  <div>
                    <span>Step 3: Profit Margin</span>
                    <span className="text-[9px] text-gray-400 block">
                      {simResults.marginType === 'fixed' ? `+৳${simResults.marginVal} flat` : `+${simResults.marginVal}% on Final Price`}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-600">+৳{simResults.marginAmount.toLocaleString()}</span>
                </div>

                {/* Selling Price */}
                <div className="flex justify-between items-center text-orange-950 bg-orange-50 p-2.5 rounded-lg border border-orange-200">
                  <span className="font-bold">Customer Selling Price</span>
                  <span className="font-black text-base text-[#ff5c00]">৳{simResults.sellingPrice.toLocaleString()}</span>
                </div>

                {/* Step 4 Floor Protection */}
                <div className="pt-2 border-t border-gray-200 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-gray-600">
                    <span>Discounts Requested:</span>
                    <span className="font-bold text-rose-600">-৳{simTestDiscount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Effective Discount:</span>
                    <span className="font-bold text-emerald-700">-৳{simResults.effectiveDiscount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-150 font-bold text-gray-900">
                    <span>Customer Payable:</span>
                    <span className="font-black text-sm text-blue-900">৳{simResults.payableAmount.toLocaleString()}</span>
                  </div>
                </div>

                {simResults.isFloorProtected && (
                  <div className="bg-amber-50 text-amber-900 p-2 rounded-lg border border-amber-200 text-[10px] font-sans font-semibold leading-relaxed flex items-start gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>ন্যূনতম মূল্য সুরক্ষা সক্রিয়! ছাড়ের পরিমাণ ৳{simTestDiscount} হলেও ফাইনাল ফ্লোর প্রাইস ৳{simResults.finalPrice} বজায় রাখতে ছাড় স্বয়ংক্রিয়ভাবে ৳{simResults.effectiveDiscount}-এ সীমাবদ্ধ করা হয়েছে।</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: INDIVIDUAL PRODUCT MARGINS & PRICING TABLE           */}
      {/* ============================================================== */}
      {activeSubTab === 'product' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900">
                Individual Product Pricing & Margin Editor
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                নির্দিষ্ট যেকোনো পণ্যের রিটেইল মূল্য (MSRP), পাইকারি ক্রয়মূল্য (Cost), মার্জিন ও বিক্রয় মূল্য সরাসরি এডিট করুন।
              </p>
            </div>

            {/* Search bar */}
            <div className="flex w-full sm:w-72 border border-gray-300 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#ff5c00] focus-within:border-[#ff5c00]">
              <input
                type="text"
                placeholder="Search by name, SKU, category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-3.5 py-2 text-xs text-gray-800 outline-none bg-white placeholder-gray-400"
              />
              <div className="bg-gray-100 px-3 flex items-center justify-center border-l border-gray-200">
                <Search className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Source Filter Quick Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 flex-wrap">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Product Source:</span>
            <button
              onClick={() => { setSourceFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sourceFilter === 'all'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              সব পণ্য ({catalogProducts.length})
            </button>
            <button
              onClick={() => { setSourceFilter('mohasagor'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                sourceFilter === 'mohasagor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              মহাসাগর API ({mohasagorCount})
            </button>
            <button
              onClick={() => { setSourceFilter('manual'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                sourceFilter === 'manual'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              নিজস্ব পণ্য ({manualCount})
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs text-gray-600 border-collapse">
              <thead>
                <tr className="border-b border-gray-100 font-bold uppercase text-[10px] text-gray-400">
                  <th className="py-3">Product Name</th>
                  <th className="py-3">Source</th>
                  <th className="py-3">SKU</th>
                  <th className="py-3">Category</th>
                  <th className="py-3 text-right">MSRP (price)</th>
                  <th className="py-3 text-right">Cost (sale_price)</th>
                  <th className="py-3 text-right">Diff (X)</th>
                  <th className="py-3 text-right">Final Price (Floor)</th>
                  <th className="py-3 text-right">Margin</th>
                  <th className="py-3 text-right">Selling Price</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-gray-400 italic">No products found.</td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const cost = Number(p.purchasePrice || p.purchase_price || 0);
                    const sell = Number(p.discountPrice || p.discount_price || p.price || 0);
                    const msrp = Number(p.price || sell);
                    const diffX = Math.max(0, msrp - cost);
                    const finalP = cost > 0 && msrp > cost 
                      ? Math.round(msrp - (deductionPercentage / 100) * diffX) 
                      : Number(p.finalPrice || p.final_price || msrp);
                    const isEditing = editingProductId === p.id;
                    const isMohasagor = p.source_id === 'mohasagor';

                    return (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                        
                        {/* Product Name */}
                        <td className="py-3 max-w-xs font-semibold text-gray-900">
                          <div className="truncate" title={p.name}>{p.name}</div>
                        </td>

                        {/* Source Badge */}
                        <td className="py-3 whitespace-nowrap">
                          {isMohasagor ? (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                              মহাসাগর API
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                              নিজস্ব পণ্য
                            </span>
                          )}
                        </td>

                        {/* SKU */}
                        <td className="py-3 font-mono text-[10px] text-gray-500 uppercase">{p.sku || 'N/A'}</td>
                        
                        {/* Category */}
                        <td className="py-3 font-semibold capitalize text-gray-500">{p.category}</td>
                        
                        {/* Retail MSRP (Editable) */}
                        <td className="py-3 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editingMSRP}
                              onChange={(e) => handleMSRPChange(e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-xs text-right font-bold outline-none focus:border-[#ff5c00] bg-white text-gray-900"
                            />
                          ) : (
                            <span className="font-bold text-gray-700">৳{msrp.toLocaleString()}</span>
                          )}
                        </td>

                        {/* Reseller Cost (Editable) */}
                        <td className="py-3 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editingCost}
                              onChange={(e) => handleCostChange(e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-xs text-right font-bold outline-none focus:border-[#ff5c00] bg-white text-gray-900"
                            />
                          ) : (
                            <span className="font-bold text-gray-700">
                              {cost > 0 ? `৳${cost.toLocaleString()}` : <span className="text-gray-400 italic">No cost</span>}
                            </span>
                          )}
                        </td>

                        {/* Difference X */}
                        <td className="py-3 text-right font-mono text-gray-500">
                          ৳{diffX.toLocaleString()}
                        </td>

                        {/* Final Price (Floor) */}
                        <td className="py-3 text-right font-mono font-bold text-emerald-700">
                          ৳{finalP.toLocaleString()}
                        </td>

                        {/* Margin (Editable) */}
                        <td className="py-3 text-right font-mono">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                value={editingMarginVal}
                                onChange={(e) => handleMarginChange(e.target.value)}
                                className="w-16 px-1.5 py-1 border border-gray-300 rounded text-xs text-right font-bold outline-none focus:border-[#ff5c00] bg-white text-gray-900"
                              />
                              <button
                                type="button"
                                onClick={() => handleMarginChange(editingMarginVal, editingMarginType === 'percentage' ? 'fixed' : 'percentage')}
                                className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                              >
                                {editingMarginType === 'percentage' ? '%' : '৳'}
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {sell > finalP ? `+৳${(sell - finalP).toLocaleString()}` : '+0'}
                            </span>
                          )}
                        </td>

                        {/* Selling Price (Editable) */}
                        <td className="py-3 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editingPrice}
                              onChange={(e) => handlePriceChange(e.target.value)}
                              className="w-20 px-2 py-1 border border-emerald-300 rounded text-xs text-right font-black outline-none focus:border-emerald-600 bg-white text-emerald-700"
                            />
                          ) : (
                            <span className="font-extrabold text-[#ff5c00]">৳{sell.toLocaleString()}</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveProductMargin(p.id)}
                                disabled={savingProduct}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1"
                              >
                                {savingProduct ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => setEditingProductId(null)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-[9px] uppercase tracking-wider px-2 py-1 rounded-lg cursor-pointer transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="text-[#ff5c00] hover:underline font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                            >
                              Edit Price
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 text-xs">
            <span className="text-gray-500 font-semibold">
              Showing {totalFiltered === 0 ? 0 : pageStart + 1}–{pageEnd} of {totalFiltered} products (Page {safeCurrentPage} of {totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Previous
              </button>
              <span className="px-2 font-mono font-bold text-gray-700">{safeCurrentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
