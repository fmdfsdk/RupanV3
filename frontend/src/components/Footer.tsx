/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useStore } from '../store/useStore';

interface FooterProps {
  onPageChange: (page: string) => void;
}

interface BrandLogoProps {
  type: 'bkash' | 'nagad' | 'rocket' | 'visa' | 'mastercard' | 'amex' | 'pathao' | 'steadfast' | 'redx' | 'paperfly';
}

function BrandLogo({ type }: BrandLogoProps) {
  const [loadError, setLoadError] = useState(false);

  const srcMap = {
    bkash: '/assets/logo-bkash.svg',
    nagad: '/assets/logo-nagad.webp',
    rocket: '/assets/logo-rocket.svg',
    visa: '/assets/logo-visa.svg',
    mastercard: '/assets/logo-mastercard.svg',
    amex: '/assets/logo-amex.svg',
    pathao: '/assets/logo-pathao.png',
    steadfast: '/assets/logo-steadfast.svg',
    redx: '/assets/logo-redx.svg',
    paperfly: '/assets/logo-paperfly.svg',
  };

  if (!loadError) {
    return (
      <div className="bg-white hover:opacity-95 border border-gray-200 transition-all rounded-lg shadow-xs flex items-center justify-center w-[96px] h-[38px] select-none p-1.5 overflow-hidden">
        <img 
          src={srcMap[type]} 
          alt={type} 
          className="w-full h-full object-contain" 
          onError={() => setLoadError(true)}
        />
      </div>
    );
  }

  switch (type) {
    case 'bkash':
      return (
        <div className="bg-[#E2125D] hover:opacity-95 transition-all rounded-lg shadow-xs flex items-center justify-center w-[96px] h-[38px] select-none p-1 border border-pink-700/15">
          <svg className="w-full h-full" viewBox="0 0 90 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(4, 0)">
              <path d="M19 15 L22.5 10.5 L17.5 11 L19 15Z" fill="#FFFFFF" />
              <path d="M11.5 21 L19 15 L14 8.5 L11.5 21Z" fill="#FCE7F3" fillOpacity="0.9" />
              <path d="M19 15 L14 22 L11.5 21 L19 15Z" fill="#FBCFE8" fillOpacity="0.8" />
              <path d="M19 15 L24 17.5 L14 22 L19 15Z" fill="#F472B6" />
            </g>
            <text x="33" y="19.5" fill="white" fontSize="13.5" fontFamily="'Inter', system-ui, -apple-system, sans-serif" fontWeight="900" letterSpacing="-0.3">bKash</text>
          </svg>
        </div>
      );
    case 'nagad':
      return (
        <div className="bg-gradient-to-r from-[#F25F22] to-[#D14410] hover:opacity-95 transition-all rounded-lg shadow-xs flex items-center justify-center w-[96px] h-[38px] select-none p-1 border border-orange-700/15">
          <svg className="w-full h-full" viewBox="0 0 90 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(4, 1)">
              <circle cx="16" cy="14" r="7" fill="white" fillOpacity="0.2" />
              <path d="M11 15 C11 11, 15 10, 18 10 C21 10, 21 13, 21 15 C21 19, 17 21, 14 21 C11 21, 11 19, 11 15 Z" fill="white" />
              <path d="M14 11 C15.5 11, 17 12, 17 14 C17 16, 15.5 18, 14 18 C12.5 18, 11.5 16, 11.5 14" stroke="#D14410" strokeWidth="1" />
              <circle cx="17" cy="14" r="1.5" fill="#F25F22" />
            </g>
            <text x="31" y="19" fill="white" fontSize="13" fontFamily="'Inter', system-ui, -apple-system, sans-serif" fontWeight="900" letterSpacing="-0.4">nagad</text>
          </svg>
        </div>
      );
    case 'rocket':
      return (
        <div className="bg-[#8C3494] hover:opacity-95 transition-all rounded-lg shadow-xs flex items-center justify-center w-[96px] h-[38px] select-none p-1 border border-purple-800/20">
          <svg className="w-full h-full" viewBox="0 0 90 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(6, 1)">
              <path d="M11 20 C11 20, 13.5 15, 17 11.5 C18.5 10, 20.5 9.5 21.5 9.5 C21.5 10.5 21 12.5 19.5 14 C16 17.5 11 20 11 20 Z" fill="white" />
              <path d="M21.5 9.5 C19.5 9.5 17.5 10 16 11.5 L14.5 10 L19 7 L21.5 9.5 Z" fill="#FFC72C" />
              <path d="M11 20 L9.5 22 L11.5 21.5 L11 20 Z" fill="#EF4444" />
              <circle cx="17.5" cy="13.5" r="1" fill="#8C3494" />
            </g>
            <text x="34" y="19.5" fill="white" fontSize="12.5" fontFamily="'Inter', system-ui, -apple-system, sans-serif" fontWeight="900" letterSpacing="0.1">Rocket</text>
          </svg>
        </div>
      );
    case 'visa':
      return (
        <div className="bg-white border border-gray-200 hover:border-gray-300 transition-all rounded-lg shadow-xs flex items-center justify-center w-[96px] h-[38px] select-none p-1">
          <svg className="w-full h-full px-1" viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(5, 1)">
              <path d="M15 6 L10.5 19.5 H7.2 L4.2 8.5 C3.8 7 3.2 6.5 2.2 6.1 V5.7 H7.5 C8.6 5.7 9.5 6.4 9.8 7.4 L11.5 15.5 L15 6 Z" fill="#1A1F71" />
              <path d="M4.2 8.5 L2.5 5.7 H0 L0.1 6 C1.8 6.5 3.1 7.2 4.2 8.5 Z" fill="#F7B600" />
              <path d="M19.5 5.7 L16.8 19.5 H20 L22.7 5.7 H19.5 Z" fill="#1A1F71" />
              <path d="M30 8.5 C29.5 7 28.2 6.2 26.5 6.2 C24.5 6.2 23 7.3 23 9 C23 11.5 26.5 11.8 26.5 13.5 C26.5 14.8 25.2 15.5 23.8 15.5 C22 15.5 20.8 14.5 20.2 13.5 L19.8 14 C20.5 15.8 22 16.8 23.8 16.8 C26 16.8 27.5 15.5 27.5 13.5 C27.5 11 24 10.7 24 9.2 C24 8.2 25.2 7.5 26.5 7.5 C27.8 7.5 28.8 8 29.5 9 L30 8.5 Z" fill="#1A1F71" />
              <path d="M38.5 5.7 L34.5 19.5 H37.5 L38.3 16.5 H43 L43.5 19.5 H46.5 L43.8 5.7 H38.5 Z M39 14.2 L41.2 9 L42.2 14.2 H39 Z" fill="#1A1F71" />
            </g>
          </svg>
        </div>
      );
    case 'mastercard':
      return (
        <div className="bg-white border border-gray-200 hover:border-gray-300 transition-all rounded-lg shadow-xs flex items-center justify-center w-[96px] h-[38px] select-none p-1">
          <svg className="w-full h-full" viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="33" cy="11" r="7" fill="#EB001B" />
            <circle cx="45" cy="11" r="7" fill="#F79E1B" fillOpacity="0.9" />
            <path d="M39 6.5C37.8 7.7 37 9.3 37 11C37 12.7 37.8 14.3 39 15.5C40.2 14.3 41 12.7 41 11C41 9.3 40.2 7.7 39 6.5Z" fill="#FF5F00" />
            <text x="39" y="25" fill="#111827" fontSize="6.5" fontFamily="system-ui, sans-serif" fontWeight="600" textAnchor="middle" letterSpacing="-0.1">mastercard</text>
          </svg>
        </div>
      );
    case 'amex':
      return (
        <div className="bg-[#0070CD] hover:opacity-95 transition-all rounded-lg shadow-xs flex items-center justify-center w-[96px] h-[38px] select-none p-1 border border-blue-700/15">
          <svg className="w-full h-full" viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="76" height="26" rx="3" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
            <text x="40" y="13.5" fill="white" fontSize="7.5" fontFamily="Georgia, serif" fontWeight="900" textAnchor="middle" letterSpacing="0.4">AMERICAN</text>
            <text x="40" y="21.5" fill="white" fontSize="7.5" fontFamily="Georgia, serif" fontWeight="900" textAnchor="middle" letterSpacing="0.4">EXPRESS</text>
          </svg>
        </div>
      );
    case 'pathao':
      return (
        <div className="bg-[#FF5C00] hover:opacity-95 transition-all rounded-lg shadow-xs flex items-center justify-center w-[96px] h-[38px] select-none p-1 border border-orange-600/15">
          <svg className="w-full h-full" viewBox="0 0 90 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(6, 1)">
              <path d="M16 8 C11 8, 8 11, 7 15 C6 18, 9 21, 13 21 C17 21, 19 18, 19 14 C19 12, 18 9, 16 8 Z M13 18 C11.5 18, 10 17, 10 15 C10 13, 11.5 12, 13 12 C14.5 12, 16 13, 16 15 C16 17, 14.5 18, 13 18 Z" fill="white" />
              <path d="M6 11 L10 12 L8 14 Z" fill="white" fillOpacity="0.7" />
              <path d="M5 15 L9 15 L7 17 Z" fill="white" fillOpacity="0.5" />
            </g>
            <text x="29" y="19" fill="white" fontSize="13" fontFamily="'Inter', system-ui, -apple-system, sans-serif" fontWeight="900" letterSpacing="-0.3">pathao</text>
          </svg>
        </div>
      );
    case 'steadfast':
      return (
        <div className="bg-[#019343] hover:opacity-95 transition-all rounded-lg shadow-xs flex items-center justify-center w-[96px] h-[38px] select-none p-1 border border-green-700/15">
          <svg className="w-full h-full" viewBox="0 0 90 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(5, 1)">
              <path d="M6 6 L12 14 L6 22 L9 14 Z" fill="white" />
              <path d="M11 6 L17 14 L11 22 L14 14 Z" fill="white" fillOpacity="0.7" />
              <rect x="6" y="24" width="11" height="1.5" rx="0.5" fill="white" fillOpacity="0.9" />
            </g>
            <text x="26" y="18" fill="white" fontSize="8.5" fontFamily="'Inter', system-ui, -apple-system, sans-serif" fontWeight="900" letterSpacing="0.4">STEADFAST</text>
            <text x="26" y="25" fill="white" fillOpacity="0.8" fontSize="5.5" fontFamily="'Inter', system-ui, -apple-system, sans-serif" fontWeight="700" letterSpacing="0.3">COURIER</text>
          </svg>
        </div>
      );
    case 'redx':
      return (
        <div className="bg-[#111116] hover:opacity-95 transition-all rounded-lg shadow-xs flex items-center justify-center w-[96px] h-[38px] select-none p-1 border border-zinc-800">
          <svg className="w-full h-full" viewBox="0 0 90 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="14" y="19.5" fill="white" fontSize="13.5" fontFamily="'Inter', system-ui, -apple-system, sans-serif" fontWeight="900" letterSpacing="0.3">RED</text>
            <g transform="translate(45, 4)">
              <path d="M4 3 L9 3 L17 19 L12 19 L4 3 Z" fill="#E51937" />
              <path d="M12 3 L17 3 L9 19 L4 19 L12 3 Z" fill="#E51937" />
            </g>
          </svg>
        </div>
      );
    case 'paperfly':
      return (
        <div className="bg-[#008FBB] hover:opacity-95 transition-all rounded-lg shadow-xs flex items-center justify-center w-[96px] h-[38px] select-none p-1 border border-blue-600/15">
          <svg className="w-full h-full" viewBox="0 0 90 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(5, 5)">
              <path d="M0 8 L17 1 L11 11 Z" fill="white" />
              <path d="M17 1 L11 11 L6 11 Z" fill="#D2F4FF" />
              <path d="M6 11 L11 11 L8 15 Z" fill="#7DD3FC" />
            </g>
            <text x="27" y="18.5" fill="white" fontSize="11" fontFamily="'Inter', system-ui, -apple-system, sans-serif" fontWeight="900" letterSpacing="-0.1">paperfly</text>
            <text x="27" y="24" fill="white" fillOpacity="0.8" fontSize="5" fontFamily="'Inter', system-ui, -apple-system, sans-serif" fontWeight="700" letterSpacing="0.2">GO FAST</text>
          </svg>
        </div>
      );
    default:
      return null;
  }
}

export default function Footer({ onPageChange }: FooterProps) {
  const dbSettings = useStore((state) => state.dbSettings);
  return (
    <footer className="bg-white text-gray-700 pt-16 pb-16 md:pb-0 border-t border-gray-200 font-sans">
      <div className="w-full max-w-[1750px] mx-auto px-4 md:px-12 lg:px-16">
        
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Logo and Contacts */}
          <div className="space-y-5">
            <div 
              onClick={() => onPageChange('home')}
              className="inline-flex items-center cursor-pointer select-none border-2 border-white bg-[#ff5c00] rounded-lg p-1.5 px-3 max-h-[50px] transition-all hover:bg-[#e04f00] shadow-md"
            >
              <img 
                src="/assets/Rupan Logo Final.png" 
                alt="Rupan" 
                width={200}
                height={200}
                className="h-8 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <p className="text-sm text-gray-500 leading-relaxed">
              Online Shopping BD has never been easier. Shop Mart is best online shopping store in Bangladesh that features 10+ million products at affordable prices.
            </p>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#ff5c00] shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">{dbSettings?.supportNumber || dbSettings?.support_number || '09678 123 456'}</p>
                  <p className="text-xs text-gray-400">9:00 AM - 11:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#ff5c00] shrink-0 mt-0.5" />
                <span className="text-gray-600 hover:text-[#ff5c00] cursor-pointer">support@doraz.com.bd</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#ff5c00] shrink-0 mt-0.5" />
                <span className="text-gray-600">House-23, Road-12, Dhanmondi, Dhaka-1209, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Column 2: Customer Service */}
          <div>
            <h4 className="text-gray-900 font-extrabold text-base mb-6 uppercase tracking-wider">
              Customer Service
            </h4>
            <ul className="space-y-3 text-sm font-medium text-left">
              {[
                { name: 'Contact Us', page: 'contact-us' },
                { name: 'Return Policy', page: 'policy' },
                { name: 'Track Order', page: 'track-order' },
                { name: 'Shipping Policy', page: 'policy' },
                { name: 'How to Buy', page: 'faq' },
                { name: 'Privacy Policy', page: 'policy' },
                { name: 'FAQ', page: 'faq' },
                { name: 'Terms & Conditions', page: 'policy' }
              ].map((item) => (
                <li key={item.name} className="flex items-center">
                  <span className="text-[#ff5c00] mr-2 font-bold select-none">&gt;</span>
                  <button onClick={() => onPageChange(item.page)} className="text-gray-600 hover:text-[#ff5c00] hover:underline cursor-pointer text-left">
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Useful Links */}
          <div>
            <h4 className="text-gray-900 font-extrabold text-base mb-6 uppercase tracking-wider">
              Useful Links
            </h4>
            <ul className="space-y-3 text-sm font-medium text-left">
              {[
                { name: 'All Products', page: 'shop' },
                { name: 'About Us', page: 'about-us' },
                { name: 'Blogs', page: 'blog' },
                { name: 'Order Returns', page: 'policy' },
                { name: 'Size Guide', page: 'faq' },
                { name: 'Flash Deals', page: 'offer' },
                { name: 'FAQ', page: 'faq' },
                { name: 'Terms & Conditions', page: 'policy' }
              ].map((item) => (
                <li key={item.name} className="flex items-center">
                  <span className="text-[#ff5c00] mr-2 font-bold select-none">&gt;</span>
                  <button onClick={() => onPageChange(item.page)} className="text-gray-600 hover:text-[#ff5c00] hover:underline cursor-pointer text-left">
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Follow Us & Download App */}
          <div className="space-y-6">
            <div>
              <h4 className="text-gray-900 font-extrabold text-base mb-4 uppercase tracking-wider">
                Follow Us
              </h4>
              <p className="text-sm text-gray-500 mb-3">Stay connected with us</p>
              <div className="flex items-center gap-2.5">
                <a href={dbSettings?.socialFacebook || dbSettings?.facebook_url || "https://www.facebook.com/rupanbd"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#3b5998] hover:opacity-90 text-white flex items-center justify-center transition-opacity" title="Facebook">
                  <Facebook className="w-4 h-4 fill-current" />
                </a>
                <a href={dbSettings?.socialTwitter || dbSettings?.twitter_url || "https://twitter.com"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-black hover:opacity-90 text-white flex items-center justify-center transition-opacity" title="Twitter">
                  <span className="font-extrabold text-xs">𝕏</span>
                </a>
                <a href={dbSettings?.socialYoutube || dbSettings?.youtube_url || "https://youtube.com"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#ff0000] hover:opacity-90 text-white flex items-center justify-center transition-opacity" title="YouTube">
                  <Youtube className="w-4 h-4 fill-current" />
                </a>
                <a href={dbSettings?.socialInstagram || dbSettings?.instagram_url || "https://www.instagram.com/rupanbd"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#c13584] hover:opacity-90 text-white flex items-center justify-center transition-opacity" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                DOWNLOAD OUR APP
              </h5>
              <div className="space-y-2 flex flex-col items-start">
                {/* Google Play Store button mockup */}
                <a href="#googleplay" className="flex items-center gap-2 bg-black text-white px-3.5 py-2 rounded-md hover:bg-zinc-900 transition-colors w-[150px] shadow-sm">
                  <span className="text-lg">🤖</span>
                  <div className="text-[9px] leading-tight text-left">
                    <p className="text-gray-400">GET IT ON</p>
                    <p className="font-bold -mt-0.5">Google Play</p>
                  </div>
                </a>
                {/* App Store button mockup */}
                <a href="#appstore" className="flex items-center gap-2 bg-black text-white px-3.5 py-2 rounded-md hover:bg-zinc-900 transition-colors w-[150px] shadow-sm">
                  <span className="text-lg">🍎</span>
                  <div className="text-[9px] leading-tight text-left">
                    <p className="text-gray-400">Download on the</p>
                    <p className="font-bold -mt-0.5">App Store</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Payment & Delivery Partners Area */}
        <div className="py-8 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm">
          <div className="space-y-3">
            <span className="text-xs uppercase font-extrabold text-gray-400 block tracking-wider">
              We Accept
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              <BrandLogo type="bkash" />
              <BrandLogo type="nagad" />
              <BrandLogo type="rocket" />
              <BrandLogo type="visa" />
              <BrandLogo type="mastercard" />
              <BrandLogo type="amex" />
            </div>
          </div>

          <div className="space-y-3 lg:text-right">
            <span className="text-xs uppercase font-extrabold text-gray-400 block tracking-wider lg:text-right">
              Our Delivery Partners
            </span>
            <div className="flex flex-wrap gap-2 items-center lg:justify-end">
              <BrandLogo type="pathao" />
              <BrandLogo type="steadfast" />
              <BrandLogo type="redx" />
              <BrandLogo type="paperfly" />
            </div>
          </div>
        </div>

      </div>

      {/* Copyright Bottom Bar (Solid Black) */}
      <div className="bg-black text-gray-400 py-5 mt-4 text-xs font-semibold">
        <div className="w-full max-w-[1750px] mx-auto px-4 md:px-12 lg:px-16 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 Shop Mart</span>
          <span>Design by <a href="#borbila" className="text-white hover:text-[#ff5c00]">Borbila</a></span>
        </div>
      </div>
    </footer>
  );
}
