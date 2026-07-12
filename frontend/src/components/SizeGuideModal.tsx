/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export default function SizeGuideModal({ isOpen, onClose, category = 'Panjabi' }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'Panjabi' | 'Shirts' | 'T-Shirts' | 'Jeans'>(
    category === 'Shirts' || category === 'Panjabi' || category === 'T-Shirts' || category === 'Jeans'
      ? (category as any)
      : 'Panjabi'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="sizeguide-modal-container"
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-brand-bg">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-brand-primary" />
            <h3 className="font-display text-lg font-bold text-brand-text">Official Size Guide</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Category select tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-2">
          {(['Panjabi', 'Shirts', 'T-Shirts', 'Jeans'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-brand-text hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sizing Tables */}
        <div className="p-6">
          <p className="text-xs text-gray-500 mb-4 text-center">
            * All measurements listed are in **inches** and denote the garment size.
          </p>

          {activeTab === 'Panjabi' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="p-3">Size Tag</th>
                    <th className="p-3">Chest</th>
                    <th className="p-3">Length</th>
                    <th className="p-3">Sleeve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  <tr>
                    <td className="p-3 font-semibold text-brand-text">M (38)</td>
                    <td className="p-3">40"</td>
                    <td className="p-3">40"</td>
                    <td className="p-3">24.5"</td>
                  </tr>
                  <tr className="bg-gray-50/30">
                    <td className="p-3 font-semibold text-brand-text">L (40)</td>
                    <td className="p-3">42"</td>
                    <td className="p-3">42"</td>
                    <td className="p-3">25"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-brand-text">XL (42)</td>
                    <td className="p-3">44"</td>
                    <td className="p-3">44"</td>
                    <td className="p-3">25.5"</td>
                  </tr>
                  <tr className="bg-gray-50/30">
                    <td className="p-3 font-semibold text-brand-text">XXL (44)</td>
                    <td className="p-3">46"</td>
                    <td className="p-3">45"</td>
                    <td className="p-3">26"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Shirts' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="p-3">Size Tag</th>
                    <th className="p-3">Chest</th>
                    <th className="p-3">Length</th>
                    <th className="p-3">Shoulder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  <tr>
                    <td className="p-3 font-semibold text-brand-text">S (38)</td>
                    <td className="p-3">39"</td>
                    <td className="p-3">27.5"</td>
                    <td className="p-3">17.5"</td>
                  </tr>
                  <tr className="bg-gray-50/30">
                    <td className="p-3 font-semibold text-brand-text">M (40)</td>
                    <td className="p-3">41"</td>
                    <td className="p-3">28.5"</td>
                    <td className="p-3">18"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-brand-text">L (42)</td>
                    <td className="p-3">43"</td>
                    <td className="p-3">29.5"</td>
                    <td className="p-3">18.5"</td>
                  </tr>
                  <tr className="bg-gray-50/30">
                    <td className="p-3 font-semibold text-brand-text">XL (44)</td>
                    <td className="p-3">45"</td>
                    <td className="p-3">30.5"</td>
                    <td className="p-3">19.2"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'T-Shirts' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="p-3">Size Tag</th>
                    <th className="p-3">Chest</th>
                    <th className="p-3">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  <tr>
                    <td className="p-3 font-semibold text-brand-text">S</td>
                    <td className="p-3">38"</td>
                    <td className="p-3">26"</td>
                  </tr>
                  <tr className="bg-gray-50/30">
                    <td className="p-3 font-semibold text-brand-text">M</td>
                    <td className="p-3">40"</td>
                    <td className="p-3">27"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-brand-text">L</td>
                    <td className="p-3">42"</td>
                    <td className="p-3">28"</td>
                  </tr>
                  <tr className="bg-gray-50/30">
                    <td className="p-3 font-semibold text-brand-text">XL</td>
                    <td className="p-3">44"</td>
                    <td className="p-3">29"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Jeans' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="p-3">Waist Tag</th>
                    <th className="p-3">Hip</th>
                    <th className="p-3">Length</th>
                    <th className="p-3">Thigh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  <tr>
                    <td className="p-3 font-semibold text-brand-text">30</td>
                    <td className="p-3">37"</td>
                    <td className="p-3">39"</td>
                    <td className="p-3">22"</td>
                  </tr>
                  <tr className="bg-gray-50/30">
                    <td className="p-3 font-semibold text-brand-text">32</td>
                    <td className="p-3">39"</td>
                    <td className="p-3">39.5"</td>
                    <td className="p-3">23"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-brand-text">34</td>
                    <td className="p-3">41"</td>
                    <td className="p-3">40"</td>
                    <td className="p-3">24"</td>
                  </tr>
                  <tr className="bg-gray-50/30">
                    <td className="p-3 font-semibold text-brand-text">36</td>
                    <td className="p-3">43"</td>
                    <td className="p-3">40.5"</td>
                    <td className="p-3">25"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Need help? Call: +8801700000000</span>
          <span>7-Day Easy Exchange Policy Applies</span>
        </div>
      </div>
    </div>
  );
}
