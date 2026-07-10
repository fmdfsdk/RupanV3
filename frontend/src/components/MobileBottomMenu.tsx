import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Heart, User } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function MobileBottomMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const currentPath = location.pathname;

  const menuItems = [
    { label: 'Home', icon: Home, path: '/', action: () => navigate('/') },
    { label: 'Shop', icon: ShoppingBag, path: '/shop', action: () => navigate('/shop') },
    { 
      label: 'Cart', 
      icon: ShoppingCart, 
      path: '/cart', 
      badge: cartCount,
      action: () => navigate('/cart') 
    },
    { 
      label: 'Wishlist', 
      icon: Heart, 
      path: '/wishlist', 
      badge: wishlistCount,
      action: () => navigate('/wishlist') 
    },
    { label: 'Account', icon: User, path: '/account', action: () => navigate('/account') }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sm:hidden px-2 py-1.5 flex justify-around items-center safe-bottom">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path;
        
        return (
          <button
            key={item.label}
            onClick={item.action}
            className="flex flex-col items-center justify-center flex-1 py-1 relative text-gray-400 active:scale-95 transition-all cursor-pointer border-0 bg-transparent select-none"
          >
            <div className="relative">
              <Icon 
                className={`w-5.5 h-5.5 transition-colors ${
                  isActive ? 'text-[#ff5c00] fill-orange-50/10' : 'text-gray-400'
                }`} 
              />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#ff5c00] text-white font-mono text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-xs border border-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span 
              className={`text-[9px] font-bold tracking-tight mt-1 transition-colors ${
                isActive ? 'text-[#ff5c00]' : 'text-gray-500'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
