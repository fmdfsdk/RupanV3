import React from 'react';
import { Ban, Users } from 'lucide-react';
import { UserProfile, Order } from '../../types';

interface CustomersTabProps {
  users: UserProfile[];
  selectedCustomer: UserProfile | null;
  setSelectedCustomer: (u: UserProfile | null) => void;
  orders: Order[];
  handleToggleUserActive: (u: UserProfile) => void;
}

export default function CustomersTab({
  users,
  selectedCustomer,
  setSelectedCustomer,
  orders,
  handleToggleUserActive
}: CustomersTabProps) {
  return (
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
                    {u.fullName[0]?.toUpperCase() || 'U'}
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
                  {selectedCustomer.fullName[0]?.toUpperCase() || 'U'}
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
                    <span className="text-xs font-bold block">Restrict Session Access</span>
                    <span className="text-[10px] text-gray-400 block leading-tight">Toggle customer login capabilities.</span>
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
  );
}
