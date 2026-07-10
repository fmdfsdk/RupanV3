import React, { useEffect, useState } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { Product } from '../types';
const formatCategoryName = (cat: string): string => {
  if (!cat) return '';
  return cat
    .split(' ')
    .map(word => {
      if (word.toLowerCase() === 'and' || word === '&') return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};
export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Local Pagination & result states
  const [pageSize] = useState<number>(24);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load all store states and actions
  const PRODUCTS = useStore((state) => state.dbProducts);
  const wishlist = useStore((state) => state.wishlist);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const addToCart = useStore((state) => state.addToCart);
  const setQuickViewProduct = useStore((state) => state.setQuickViewProduct);

  const selectedCategory = useStore((state) => state.selectedCategory);
  const setSelectedCategory = useStore((state) => state.setSelectedCategory);
  const selectedGender = useStore((state) => state.selectedGender);
  const setSelectedGender = useStore((state) => state.setSelectedGender);
  const searchQuery = useStore((state) => state.searchQuery);
  const setSearchQuery = useStore((state) => state.setSearchQuery);

  const checkedCategories = useStore((state) => state.checkedCategories);
  const setCheckedCategories = useStore((state) => state.setCheckedCategories);
  const checkedSubCategories = useStore((state) => state.checkedSubCategories);
  const setCheckedSubCategories = useStore((state) => state.setCheckedSubCategories);
  const selectedBrands = useStore((state) => state.selectedBrands);
  const setSelectedBrands = useStore((state) => state.setSelectedBrands);
  const minPrice = useStore((state) => state.minPrice);
  const setMinPrice = useStore((state) => state.setMinPrice);
  const maxPrice = useStore((state) => state.maxPrice);
  const setMaxPrice = useStore((state) => state.setMaxPrice);
  const selectedStock = useStore((state) => state.selectedStock);
  const setSelectedStock = useStore((state) => state.setSelectedStock);
  const sidebarSearch = useStore((state) => state.sidebarSearch);
  const setSidebarSearch = useStore((state) => state.setSidebarSearch);
  const sortBy = useStore((state) => state.sortBy);
  const setSortBy = useStore((state) => state.setSortBy);

  const categoriesExpanded = useStore((state) => state.categoriesExpanded);
  const setCategoriesExpanded = useStore((state) => state.setCategoriesExpanded);
  const subCategoriesExpanded = useStore((state) => state.subCategoriesExpanded);
  const setSubCategoriesExpanded = useStore((state) => state.setSubCategoriesExpanded);
  const brandExpanded = useStore((state) => state.brandExpanded);
  const setBrandExpanded = useStore((state) => state.setBrandExpanded);
  const priceExpanded = useStore((state) => state.priceExpanded);
  const setPriceExpanded = useStore((state) => state.setPriceExpanded);
  const stockExpanded = useStore((state) => state.stockExpanded);
  const setStockExpanded = useStore((state) => state.setStockExpanded);

  const appliedFilters = useStore((state) => state.appliedFilters);
  const setAppliedFilters = useStore((state) => state.setAppliedFilters);

  // Read current URL parameter states (and fallback to defaults)
  const urlCategory = searchParams.get('category') || 'All';
  const urlGender = searchParams.get('gender') || 'All';
  const urlSearch = searchParams.get('search') || '';
  const urlSortBy = searchParams.get('sortBy') || 'Popularity';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  
  const urlCategories = searchParams.get('categories') ? searchParams.get('categories')!.split(',') : [];
  const urlSubCategories = searchParams.get('subCategories') ? searchParams.get('subCategories')!.split(',') : [];
  const urlBrands = searchParams.get('brands') ? searchParams.get('brands')!.split(',') : [];
  const urlMinPrice = searchParams.get('minPrice') || '';
  const urlMaxPrice = searchParams.get('maxPrice') || '';
  const urlStock = searchParams.get('stock') ? searchParams.get('stock')!.split(',') : [];

  // Initialize URL params from Zustand store if present (for navigation from homepage/search)
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let updated = false;
    
    if (selectedCategory !== 'All' && !searchParams.has('category')) {
      params.set('category', selectedCategory);
      updated = true;
    }
    if (selectedGender !== 'All' && !searchParams.has('gender')) {
      params.set('gender', selectedGender);
      updated = true;
    }
    if (searchQuery && !searchParams.has('search')) {
      params.set('search', searchQuery);
      updated = true;
    }
    
    if (updated) {
      setSearchParams(params);
    }
  }, []);

  // Sync component checkbox state from URL params
  useEffect(() => {
    setCheckedCategories(searchParams.get('categories') ? searchParams.get('categories')!.split(',') : []);
    setCheckedSubCategories(searchParams.get('subCategories') ? searchParams.get('subCategories')!.split(',') : []);
    setSelectedBrands(searchParams.get('brands') ? searchParams.get('brands')!.split(',') : []);
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSelectedStock(searchParams.get('stock') ? searchParams.get('stock')!.split(',') : []);
    setSidebarSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    if (checkedCategories.length > 0) {
      params.set('categories', checkedCategories.join(','));
    } else {
      params.delete('categories');
    }
    
    if (checkedSubCategories.length > 0) {
      params.set('subCategories', checkedSubCategories.join(','));
    } else {
      params.delete('subCategories');
    }
    
    if (selectedBrands.length > 0) {
      params.set('brands', selectedBrands.join(','));
    } else {
      params.delete('brands');
    }
    
    if (minPrice) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }
    
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }
    
    if (selectedStock.length > 0) {
      params.set('stock', selectedStock.join(','));
    } else {
      params.delete('stock');
    }
    
    if (sidebarSearch) {
      params.set('search', sidebarSearch);
    } else {
      params.delete('search');
    }
    
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setCheckedCategories([]);
    setCheckedSubCategories([]);
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedStock([]);
    setSidebarSearch('');
    
    // Reset all filter search params
    const params = new URLSearchParams();
    params.set('category', 'All');
    params.set('gender', 'All');
    params.set('page', '1');
    setSearchParams(params);
  };

  // Load products dynamically from database or fallback to offline client-side filtering
  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      const isOnline = useStore.getState().isSupabaseOnline;
      if (!isOnline) {
        const clientFiltered = getFilteredProducts();
        setFilteredProducts(clientFiltered.slice((urlPage - 1) * pageSize, urlPage * pageSize));
        setTotalCount(clientFiltered.length);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { products, count } = await productService.fetchProductsFiltered({
          category: urlCategory,
          categories: urlCategories,
          gender: urlGender,
          brands: urlBrands,
          subCategories: urlSubCategories,
          minPrice: urlMinPrice ? parseFloat(urlMinPrice) : undefined,
          maxPrice: urlMaxPrice ? parseFloat(urlMaxPrice) : undefined,
          stock: urlStock,
          search: urlSearch,
          sortBy: urlSortBy,
          page: urlPage,
          limit: pageSize
        });
        if (active) {
          setFilteredProducts(products);
          setTotalCount(count);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadProducts();
    return () => {
      active = false;
    };
  }, [searchParams, PRODUCTS]);

  function getFilteredProducts() {
    let filtered = PRODUCTS.filter((p) => {
      // Category filter
      let matchCategory = true;
      if (urlCategories.length > 0) {
        matchCategory = urlCategories.includes(p.category);
      } else if (urlCategory && urlCategory !== 'All') {
        if (urlCategory === 'New Arrivals') {
          matchCategory = p.isNew;
        } else if (urlCategory === 'Best Sellers') {
          matchCategory = p.isBestSeller;
        } else if (urlCategory === 'Flash Sale') {
          matchCategory = p.isFlashSale;
        } else {
          matchCategory = p.category === urlCategory;
        }
      }

      // Gender filter
      const matchGender = urlGender === 'All' || p.gender === urlGender;

      // Brand filter
      let matchBrand = true;
      if (urlBrands.length > 0) {
        const pBrand = p.brand || 'No Brand';
        matchBrand = urlBrands.includes(pBrand);
      }

      // Price filter
      let matchPrice = true;
      const actualPrice = p.discountPrice || p.price;
      if (urlMinPrice) {
        matchPrice = matchPrice && actualPrice >= parseFloat(urlMinPrice);
      }
      if (urlMaxPrice) {
        matchPrice = matchPrice && actualPrice <= parseFloat(urlMaxPrice);
      }

      // Stock status filter
      let matchStock = true;
      if (urlStock.length > 0) {
        const inStockSelected = urlStock.includes('In Stock');
        const outStockSelected = urlStock.includes('Out of Stock');
        if (inStockSelected && !outStockSelected) {
          matchStock = p.stock > 0;
        } else if (outStockSelected && !inStockSelected) {
          matchStock = p.stock === 0;
        }
      }

      // Sidebar/Text search filter
      let matchSearch = true;
      const q = (sidebarSearch || urlSearch).toLowerCase().trim();
      if (q) {
        matchSearch = p.name.toLowerCase().includes(q) || 
                      (p.category && p.category.toLowerCase().includes(q)) || 
                      p.id.toLowerCase().includes(q) || 
                      (p.sku && p.sku.toLowerCase().includes(q));
      }

      // Sub-category filter
      let matchSubCategory = true;
      if (urlSubCategories.length > 0) {
        matchSubCategory = urlSubCategories.includes(p.subCategory || '');
      }

      return matchCategory && matchSubCategory && matchGender && matchBrand && matchPrice && matchStock && matchSearch;
    });

    // Handle interactive sorting
    if (urlSortBy === 'Price: Low to High') {
      filtered = [...filtered].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (urlSortBy === 'Price: High to Low') {
      filtered = [...filtered].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (urlSortBy === 'Newest Arrivals') {
      filtered = [...filtered].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (urlSortBy === 'Popularity') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  };

  const handleBuyNow = (product: any, size: string, color: string) => {
    addToCart(product, size, color, 1);
    navigate('/checkout');
  };

  return (
    <div className="w-full bg-[#f4f6f8] min-h-screen font-sans pb-16">
      
      {/* Page Header */}
      <div className="bg-[#fff1eb] w-full py-10 text-center border-b border-gray-100 mb-8">
        <h1 className="font-sans font-black text-3xl tracking-tight text-gray-900">Shop</h1>
      </div>

      {/* 2-Column Filtering & Store Setup */}
      <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Filter Sidebar */}
        <div className="w-full lg:w-68 space-y-5 shrink-0">
          
          {/* Search Products Sidebar Box */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-3">Search Products</h3>
            <div className="flex rounded-md border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-[#ff5c00] focus-within:border-[#ff5c00]">
              <input 
                type="text"
                placeholder="Find your product..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilters();
                }}
                className="flex-1 min-w-0 px-3 py-2 text-xs text-gray-800 outline-none bg-white placeholder-gray-400"
              />
              <button 
                onClick={handleApplyFilters}
                className="bg-[#111827] hover:bg-black text-white px-3.5 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sidebar Filter Container */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Filter Options</h3>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#ff5c00] hover:underline cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Categories Collapsible */}
            <div className="space-y-3">
              <button 
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="flex items-center justify-between w-full text-left cursor-pointer"
              >
                <span className="text-xs uppercase font-extrabold text-gray-900 tracking-wider">Categories</span>
                <span className="w-5 h-5 bg-[#ffece2] rounded-full flex items-center justify-center text-[#ff5c00] text-xs font-black select-none">
                  {categoriesExpanded ? '−' : '+'}
                </span>
              </button>
              
              {categoriesExpanded && (
                <div className="space-y-2.5 pt-1">
                  {Array.from(new Set(PRODUCTS.map(p => p.category).filter(Boolean))).map((cat) => {
                    const count = PRODUCTS.filter(p => p.category === cat).length;
                    const isChecked = checkedCategories.includes(cat);
                    return (
                      <label key={cat} className="flex items-center justify-between group cursor-pointer text-sm">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setCheckedCategories(
                                isChecked ? checkedCategories.filter(c => c !== cat) : [...checkedCategories, cat]
                              );
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-[#ff5c00] focus:ring-[#ff5c00] focus:ring-opacity-25 focus:ring-offset-0 accent-[#ff5c00]"
                          />
                          <span className={`text-xs font-medium text-gray-700 group-hover:text-black transition-colors ${isChecked ? 'text-gray-955 font-bold' : ''}`}>
                            {formatCategoryName(cat)}
                          </span>
                        </div>
                        <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Subcategories Collapsible */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <button 
                onClick={() => setSubCategoriesExpanded(!subCategoriesExpanded)}
                className="flex items-center justify-between w-full text-left cursor-pointer"
              >
                <span className="text-xs uppercase font-extrabold text-gray-900 tracking-wider">Sub Categories</span>
                <span className="w-5 h-5 bg-[#ffece2] rounded-full flex items-center justify-center text-[#ff5c00] text-xs font-black select-none">
                  {subCategoriesExpanded ? '−' : '+'}
                </span>
              </button>
              
              {subCategoriesExpanded && (
                <div className="space-y-2.5 pt-1">
                  {Array.from(new Set(PRODUCTS.map(p => p.subCategory || '').filter(Boolean))).map((sub) => {
                    const count = PRODUCTS.filter(p => (p.subCategory) === sub).length;
                    const isChecked = checkedSubCategories.includes(sub);
                    return (
                      <label key={sub} className="flex items-center justify-between group cursor-pointer text-sm">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setCheckedSubCategories(
                                isChecked ? checkedSubCategories.filter(s => s !== sub) : [...checkedSubCategories, sub]
                              );
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-[#ff5c00] focus:ring-[#ff5c00] focus:ring-opacity-25 focus:ring-offset-0 accent-[#ff5c00]"
                          />
                          <span className={`text-xs font-medium text-gray-700 group-hover:text-black transition-colors ${isChecked ? 'text-gray-955 font-bold' : ''}`}>
                            {sub}
                          </span>
                        </div>
                        <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Brand Collapsible */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <button 
                onClick={() => setBrandExpanded(!brandExpanded)}
                className="flex items-center justify-between w-full text-left cursor-pointer"
              >
                <span className="text-xs uppercase font-extrabold text-gray-900 tracking-wider">Brand</span>
                <span className="w-5 h-5 bg-[#ffece2] rounded-full flex items-center justify-center text-[#ff5c00] text-xs font-black select-none">
                  {brandExpanded ? '−' : '+'}
                </span>
              </button>

              {brandExpanded && (
                <div className="space-y-2.5 pt-1">
                  {Array.from(new Set(PRODUCTS.map(p => {
                    const b = p.brand ? p.brand.replace(/reseller/gi, '').trim() || 'Rupan' : 'Rupan';
                    return b;
                  }).filter(Boolean))).map((brand) => {
                    const count = PRODUCTS.filter(p => {
                      const b = p.brand ? p.brand.replace(/reseller/gi, '').trim() || 'Rupan' : 'Rupan';
                      return b === brand;
                    }).length;
                    const isChecked = selectedBrands.includes(brand);
                    return (
                      <label key={brand} className="flex items-center justify-between group cursor-pointer text-sm">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedBrands(
                                isChecked ? selectedBrands.filter(b => b !== brand) : [...selectedBrands, brand]
                              );
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-[#ff5c00] focus:ring-[#ff5c00] focus:ring-opacity-25 accent-[#ff5c00]"
                          />
                          <span className={`text-xs font-medium text-gray-700 group-hover:text-black transition-colors ${isChecked ? 'text-gray-955 font-bold text-gray-955' : ''}`}>
                            {brand}
                          </span>
                        </div>
                        <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Range Collapsible */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <button 
                onClick={() => setPriceExpanded(!priceExpanded)}
                className="flex items-center justify-between w-full text-left cursor-pointer"
              >
                <span className="text-xs uppercase font-extrabold text-gray-900 tracking-wider">Price Range</span>
                <span className="w-5 h-5 bg-[#ffece2] rounded-full flex items-center justify-center text-[#ff5c00] text-xs font-black select-none">
                  {priceExpanded ? '−' : '+'}
                </span>
              </button>

              {priceExpanded && (
                <div className="pt-1 space-y-2.5">
                  <div className="flex items-center gap-2">
                    {/* Min Price */}
                    <div className="relative flex-1 rounded-md border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-[#ff5c00] focus-within:border-[#ff5c00]">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">৳</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 text-xs outline-none bg-white text-gray-800 placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    
                    <span className="text-gray-400 text-xs">−</span>
                    
                    {/* Max Price */}
                    <div className="relative flex-1 rounded-md border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-[#ff5c00] focus-within:border-[#ff5c00]">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">৳</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 text-xs outline-none bg-white text-gray-800 placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stock Status Collapsible */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <button 
                onClick={() => setStockExpanded(!stockExpanded)}
                className="flex items-center justify-between w-full text-left cursor-pointer"
              >
                <span className="text-xs uppercase font-extrabold text-gray-900 tracking-wider">Stock Status</span>
                <span className="w-5 h-5 bg-[#ffece2] rounded-full flex items-center justify-center text-[#ff5c00] text-xs font-black select-none">
                  {stockExpanded ? '−' : '+'}
                </span>
              </button>

              {stockExpanded && (
                <div className="space-y-2.5 pt-1">
                  {['In Stock', 'Out of Stock'].map((status) => {
                    const count = status === 'In Stock' 
                      ? PRODUCTS.filter(p => p.stock > 0).length
                      : PRODUCTS.filter(p => p.stock === 0).length;
                    const isChecked = selectedStock.includes(status);
                    return (
                      <label key={status} className="flex items-center justify-between group cursor-pointer text-sm">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedStock(
                                isChecked ? selectedStock.filter(s => s !== status) : [...selectedStock, status]
                              );
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-[#ff5c00] focus:ring-[#ff5c00] focus:ring-opacity-25 accent-[#ff5c00]"
                          />
                          <span className={`text-xs font-medium text-gray-700 group-hover:text-black transition-colors ${isChecked ? 'text-gray-955 font-bold text-gray-950' : ''}`}>
                            {status}
                          </span>
                        </div>
                        <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions Area */}
            <div className="border-t border-gray-100 pt-5 space-y-2.5">
              <button
                onClick={handleApplyFilters}
                className="w-full bg-[#ff5c00] hover:bg-[#e04f00] text-white text-xs font-bold py-2.5 px-4 rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                Apply Filter
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-black py-1.5 transition-colors cursor-pointer"
              >
                Reset All
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Products list */}
        <div className="flex-1 space-y-4">
          
          {/* Product Count Indicator & Sorting */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs text-gray-500 py-1">
            <div>
              Showing <strong>{isLoading ? '...' : filteredProducts.length}</strong> of <strong>{totalCount}</strong> items
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">Sort By:</span>
                <select 
                  value={urlSortBy}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams);
                    params.set('sortBy', e.target.value);
                    params.set('page', '1');
                    setSearchParams(params);
                  }}
                  className="bg-transparent font-bold text-[#ff5c00] outline-none cursor-pointer border-none text-xs focus:ring-0"
                >
                  <option value="Popularity">Popularity</option>
                  <option value="Newest Arrivals">Newest Arrivals</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid / Loading skeletons */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-100 p-4 space-y-4 animate-pulse">
                  <div className="bg-gray-100 aspect-square rounded-md w-full" />
                  <div className="space-y-2">
                    <div className="bg-gray-100 h-3.5 w-3/4 rounded-sm" />
                    <div className="bg-gray-100 h-3 w-1/2 rounded-sm" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="bg-gray-100 h-4.5 w-1/4 rounded-sm" />
                    <div className="bg-gray-150 h-8 w-1/3 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    onAddToCart={addToCart}
                    onBuyNow={handleBuyNow}
                    onToggleWishlist={toggleWishlist}
                    isWishlisted={wishlist.some((w) => w.id === product.id)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalCount > pageSize && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    disabled={urlPage === 1}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', String(Math.max(urlPage - 1, 1)));
                      setSearchParams(params);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white border border-gray-200 px-3 py-1.5 rounded-md text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.ceil(totalCount / pageSize) }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === urlPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.set('page', String(pageNum));
                          setSearchParams(params);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-[#ff5c00] text-white shadow-xs' 
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={urlPage === Math.ceil(totalCount / pageSize)}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', String(Math.min(urlPage + 1, Math.ceil(totalCount / pageSize))));
                      setSearchParams(params);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white border border-gray-200 px-3 py-1.5 rounded-md text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center space-y-4 shadow-2xs">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-sans font-bold text-lg text-gray-900 uppercase">No products matched</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                We currently do not have matching items under the specified sidebar filter configuration. Try resetting some filters or search query!
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-[#ff5c00] hover:bg-[#e04f00] text-white font-bold text-xs px-5 py-2.5 rounded-md cursor-pointer transition-colors shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
