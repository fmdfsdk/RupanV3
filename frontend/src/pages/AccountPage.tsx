import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function AccountPage() {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const orders = useStore((state) => state.orders);
  const setLastPlacedOrder = useStore((state) => state.setLastPlacedOrder);
  const addToast = useStore((state) => state.addToast);

  const [subTab, setSubTab] = useState<string>('Dashboard');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Login States
  const [loginUsername, setLoginUsername] = useState<string>('test');
  const [loginPassword, setLoginPassword] = useState<string>('test');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Register form states
  const [regUsername, setRegUsername] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');

  // Account Details Edit States
  const [profileFirstName, setProfileFirstName] = useState<string>('test');
  const [profileLastName, setProfileLastName] = useState<string>('');
  const [profileDisplayName, setProfileDisplayName] = useState<string>('test');
  const [profileEmail, setProfileEmail] = useState<string>('phone-534534563453-nz9rfv2h@borbila.invalid');

  // Address Edit States
  const [addressBillingStreet, setAddressBillingStreet] = useState<string>('test');
  const [addressBillingCity, setAddressBillingCity] = useState<string>('Dhaka');
  const [addressBillingZip, setAddressBillingZip] = useState<string>('1000');
  const [addressShippingStreet, setAddressShippingStreet] = useState<string>('test');
  const [addressShippingCity, setAddressShippingCity] = useState<string>('Dhaka');
  const [addressShippingZip, setAddressShippingZip] = useState<string>('1000');

  const [isEditingBilling, setIsEditingBilling] = useState<boolean>(false);
  const [isEditingShipping, setIsEditingShipping] = useState<boolean>(false);

  // Synchronize profile inputs with currentUser
  useEffect(() => {
    if (currentUser) {
      setAddressBillingStreet(currentUser.billingAddress || 'test');
      setAddressBillingCity(currentUser.city || 'Dhaka');
      setAddressBillingZip(currentUser.zip || '1000');
      setAddressShippingStreet(currentUser.shippingAddress || 'test');
      setAddressShippingCity(currentUser.city || 'Dhaka');
      setAddressShippingZip(currentUser.zip || '1000');
      
      setProfileFirstName(currentUser.username || 'test');
      setProfileDisplayName(currentUser.displayName || currentUser.username || 'test');
      setProfileEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername.trim() === 'test' && loginPassword === 'test') {
      setCurrentUser({
        username: 'test',
        displayName: 'test',
        email: 'phone-534534563453-nz9rfv2h@borbila.invalid',
        phone: '534534563453',
        billingAddress: 'test',
        shippingAddress: 'test',
        city: 'Dhaka',
        zip: '1000'
      });
      setSubTab('Dashboard');
    } else {
      setCurrentUser({
        username: loginUsername.trim(),
        displayName: loginUsername.trim(),
        email: `${loginUsername.trim()}@gmail.com`,
        phone: '01711223344',
        billingAddress: 'Dhaka, Bangladesh',
        shippingAddress: 'Dhaka, Bangladesh',
        city: 'Dhaka',
        zip: '1212'
      });
      setSubTab('Dashboard');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      addToast('Passwords do not match!', 'error');
      return;
    }
    setCurrentUser({
      username: regUsername || 'test',
      displayName: regUsername || 'test',
      email: regEmail || 'test@gmail.com',
      phone: '01700000000',
      billingAddress: 'test',
      shippingAddress: 'test',
      city: 'Dhaka',
      zip: '1000'
    });
    setSubTab('Dashboard');
    setIsRegistering(false);
  };

  const handleBillingSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      billingAddress: addressBillingStreet,
      city: addressBillingCity,
      zip: addressBillingZip
    });
    setIsEditingBilling(false);
    addToast('Billing address updated successfully!', 'success');
  };

  const handleShippingSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      shippingAddress: addressShippingStreet,
      city: addressShippingCity,
      zip: addressShippingZip
    });
    setIsEditingShipping(false);
    addToast('Shipping address updated successfully!', 'success');
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      displayName: profileDisplayName,
      email: profileEmail
    });
    addToast('Profile changes updated successfully!', 'success');
  };

  return (
    <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 py-12">
      {!currentUser ? (
        /* --- LOGIN & REGISTRATION SYSTEM --- */
        <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="flex justify-center pb-2">
            <div className="border-2 border-[#ff5c00] bg-[#ff5c00]/5 rounded-xl p-2 px-4 max-h-[55px] shadow-xs flex items-center justify-center">
              <span className="text-[#ff5c00] font-bold tracking-tight">Rupan Store</span>
            </div>
          </div>

          {!isRegistering ? (
            /* Login Mode */
            <>
              <div className="text-center space-y-2">
                <h1 className="font-display text-4xl font-black text-gray-900 tracking-tight">Login</h1>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Sign in to your account to continue shopping, track orders, and manage your profile.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Number or Email *</label>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="test"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00] font-sans"
                  />
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-xs uppercase font-extrabold text-gray-500 tracking-wider block">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-[#ff5c00] font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff5c00]"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-[#ff5c00] focus:ring-[#ff5c00]"
                    />
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#ff5c00] hover:bg-[#cc4a00] text-white font-extrabold text-xs py-3.5 rounded-lg tracking-wider uppercase transition-all shadow-md cursor-pointer"
                >
                  LOG IN
                </button>

                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => addToast('Password reset link has been simulated sent to your email', 'info')}
                    className="text-xs font-semibold text-[#ff5c00] hover:underline cursor-pointer"
                  >
                    Lost your password?
                  </button>
                </div>
              </form>

              <div className="border-t border-gray-100 pt-5 text-center space-y-3">
                <p className="text-xs font-bold text-gray-400">NEW MEMBER?</p>
                <button
                  onClick={() => setIsRegistering(true)}
                  className="w-full border border-[#ff5c00] text-[#ff5c00] hover:bg-orange-50 font-extrabold text-xs py-3 rounded-lg tracking-wider uppercase transition-all cursor-pointer"
                >
                  Create New Account
                </button>
              </div>
            </>
          ) : (
            /* Register Mode */
            <>
              <div className="text-center space-y-2">
                <h1 className="font-display text-3xl font-black text-gray-900 tracking-tight">Register</h1>
                <p className="text-xs text-gray-500">
                  Create a premium account to get points, track shipments, and receive VIP discounts.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Username *</label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. test"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Email address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Password *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#ff5c00] hover:bg-[#cc4a00] text-white font-extrabold text-xs py-3.5 rounded-lg tracking-wider uppercase transition-all shadow-md cursor-pointer"
                >
                  REGISTER
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-xs font-semibold text-[#ff5c00] hover:underline cursor-pointer"
                  >
                    Already have an account? Back to Login
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      ) : (
        /* --- AUTHENTICATED MEMBER DASHBOARD TABS SYSTEM --- */
        <div className="space-y-8">
          
          {/* Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 max-w-5xl mx-auto">
            {['Dashboard', 'Orders', 'Addresses', 'Account Details', 'Logout'].map((tab) => {
              const isActive = subTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    if (tab === 'Logout') {
                      setCurrentUser(null);
                      setSubTab('Dashboard');
                    } else {
                      setSubTab(tab);
                    }
                  }}
                  className={`font-sans font-extrabold text-[11px] md:text-xs py-3 px-4 border text-center uppercase tracking-wider transition-all rounded-sm cursor-pointer ${
                    isActive
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-800 hover:text-[#ff5c00] border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Sub-tab Content Area */}
          <div className="max-w-5xl mx-auto bg-white border border-gray-100 rounded-xl p-6 md:p-8 shadow-xs">
            
            {/* TAB 1: DASHBOARD */}
            {subTab === 'Dashboard' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-orange-50/40 via-white to-orange-50/20 border border-orange-100/75 rounded-2xl p-6 md:p-8 max-w-2xl text-left">
                  <span className="text-xs font-extrabold uppercase text-[#ff5c00] tracking-widest block">HELLO</span>
                  <h2 className="text-4xl font-black text-gray-900 mt-1 mb-6">
                    {currentUser.displayName || currentUser.username}
                  </h2>
                  
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="bg-white border border-orange-100 p-5 rounded-xl min-w-[170px] text-left shadow-2xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#ff5c00]">Completed Orders</span>
                      <div className="text-3xl font-black text-gray-900 mt-2">
                        {orders.filter(o => o.customerName === currentUser.username && o.status === 'Delivered').length}
                      </div>
                    </div>
                    <div className="bg-white border border-orange-100 p-5 rounded-xl min-w-[170px] text-left shadow-2xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#ff5c00]">Active Orders</span>
                      <div className="text-3xl font-black text-gray-900 mt-2">
                        {orders.filter(o => o.customerName === currentUser.username && o.status !== 'Delivered').length}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-50 justify-start">
                  <button
                    onClick={() => setSubTab('Orders')}
                    className="bg-[#cc4a00] hover:bg-black text-white text-[11px] font-extrabold py-2.5 px-5 rounded-md transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                  >
                    Recent Orders
                  </button>
                  <button
                    onClick={() => setSubTab('Addresses')}
                    className="bg-[#cc4a00] hover:bg-black text-white text-[11px] font-extrabold py-2.5 px-5 rounded-md transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                  >
                    Addresses
                  </button>
                  <button
                    onClick={() => setSubTab('Account Details')}
                    className="bg-[#cc4a00] hover:bg-black text-white text-[11px] font-extrabold py-2.5 px-5 rounded-md transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                  >
                    Account Details
                  </button>
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      setSubTab('Dashboard');
                    }}
                    className="bg-gray-800 hover:bg-red-700 text-white text-[11px] font-extrabold py-2.5 px-5 rounded-md transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: ORDERS LIST */}
            {subTab === 'Orders' && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-black text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-3">
                  My Placed Orders
                </h3>
                
                {orders.filter(o => o.customerName === currentUser.username).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans">
                      <thead>
                        <tr className="border-b border-gray-200 text-xs font-black uppercase text-gray-400">
                          <th className="pb-3 pr-4">Order</th>
                          <th className="pb-3 px-4">Date</th>
                          <th className="pb-3 px-4">Status</th>
                          <th className="pb-3 px-4">Total</th>
                          <th className="pb-3 pl-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {orders
                          .filter(o => o.customerName === currentUser.username)
                          .map((o) => (
                            <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 pr-4 text-[#ff5c00] font-extrabold">
                                #{o.id}
                              </td>
                              <td className="py-4 px-4 text-gray-500 font-semibold">
                                {o.createdAt}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                  o.status === 'Delivered'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : o.status === 'Shipped' || o.status === 'Processing'
                                    ? 'bg-blue-50 text-brand-primary'
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-gray-800 font-extrabold">
                                {o.total.toLocaleString('en-IN')}৳ for {o.items.reduce((sum, i) => sum + i.quantity, 0)} items
                              </td>
                              <td className="py-4 pl-4 text-right">
                                <button
                                  onClick={() => {
                                    setLastPlacedOrder(o);
                                    navigate('/order-success');
                                  }}
                                  className="bg-[#ff5c00] hover:bg-black text-white text-[10px] font-extrabold px-3 py-1.5 rounded-sm uppercase tracking-wider cursor-pointer"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic py-4">No orders have been registered yet.</p>
                )}
              </div>
            )}

            {/* TAB 3: ADDRESSES */}
            {subTab === 'Addresses' && (
              <div className="space-y-6 text-left">
                <p className="text-sm text-gray-600 leading-relaxed font-semibold">
                  The following addresses will be used on the checkout page by default.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  
                  {/* Billing Column */}
                  <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <h4 className="font-display text-base font-black text-gray-900 uppercase tracking-wide">
                        Billing address
                      </h4>
                      {!isEditingBilling && (
                        <button
                          onClick={() => setIsEditingBilling(true)}
                          className="text-xs font-black text-[#ff5c00] hover:underline uppercase tracking-wider cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {isEditingBilling ? (
                      <form onSubmit={handleBillingSave} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Street Address *</label>
                          <input
                            type="text"
                            required
                            value={addressBillingStreet}
                            onChange={(e) => setAddressBillingStreet(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ff5c00]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">City *</label>
                            <input
                              type="text"
                              required
                              value={addressBillingCity}
                              onChange={(e) => setAddressBillingCity(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ff5c00]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Postcode / ZIP *</label>
                            <input
                              type="text"
                              required
                              value={addressBillingZip}
                              onChange={(e) => setAddressBillingZip(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ff5c00]"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            className="bg-[#ff5c00] text-white text-[10px] font-bold px-3 py-2 rounded-md uppercase tracking-wider cursor-pointer hover:bg-black transition-colors"
                          >
                            Save Address
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAddressBillingStreet(currentUser.billingAddress || '');
                              setAddressBillingCity(currentUser.city || 'Dhaka');
                              setAddressBillingZip(currentUser.zip || '1000');
                              setIsEditingBilling(false);
                            }}
                            className="bg-gray-200 text-gray-700 text-[10px] font-bold px-3 py-2 rounded-md uppercase tracking-wider cursor-pointer hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-sm text-gray-600 space-y-1 font-semibold leading-relaxed text-left">
                        <p className="text-gray-900 font-extrabold">{currentUser.displayName || currentUser.username}</p>
                        <p>{currentUser.billingAddress || 'Not set yet'}</p>
                        <p>{currentUser.city || 'Dhaka'}</p>
                        <p>{currentUser.zip || '1000'}</p>
                        <p className="text-xs text-[#ff5c00] pt-2">Bangladesh</p>
                      </div>
                    )}
                  </div>

                  {/* Shipping Column */}
                  <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <h4 className="font-display text-base font-black text-gray-900 uppercase tracking-wide">
                        Shipping address
                      </h4>
                      {!isEditingShipping && (
                        <button
                          onClick={() => setIsEditingShipping(true)}
                          className="text-xs font-black text-[#ff5c00] hover:underline uppercase tracking-wider cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {isEditingShipping ? (
                      <form onSubmit={handleShippingSave} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Street Address *</label>
                          <input
                            type="text"
                            required
                            value={addressShippingStreet}
                            onChange={(e) => setAddressShippingStreet(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ff5c00]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">City *</label>
                            <input
                              type="text"
                              required
                              value={addressShippingCity}
                              onChange={(e) => setAddressShippingCity(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ff5c00]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Postcode / ZIP *</label>
                            <input
                              type="text"
                              required
                              value={addressShippingZip}
                              onChange={(e) => setAddressShippingZip(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ff5c00]"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            className="bg-[#ff5c00] text-white text-[10px] font-bold px-3 py-2 rounded-md uppercase tracking-wider cursor-pointer hover:bg-black transition-colors"
                          >
                            Save Address
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAddressShippingStreet(currentUser.shippingAddress || '');
                              setAddressShippingCity(currentUser.city || 'Dhaka');
                              setAddressShippingZip(currentUser.zip || '1000');
                              setIsEditingShipping(false);
                            }}
                            className="bg-gray-200 text-gray-700 text-[10px] font-bold px-3 py-2 rounded-md uppercase tracking-wider cursor-pointer hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-sm text-gray-600 space-y-1 font-semibold leading-relaxed text-left">
                        <p className="text-gray-900 font-extrabold">{currentUser.displayName || currentUser.username}</p>
                        <p>{currentUser.shippingAddress || 'Not set yet'}</p>
                        <p>{currentUser.city || 'Dhaka'}</p>
                        <p>{currentUser.zip || '1000'}</p>
                        <p className="text-xs text-[#ff5c00] pt-2">Bangladesh</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB 4: ACCOUNT DETAILS FORM */}
            {subTab === 'Account Details' && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-black text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-3">
                  Account Details
                </h3>

                <form onSubmit={handleProfileSave} className="space-y-5 max-w-xl text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-extrabold text-gray-500">First name *</label>
                      <input
                        type="text"
                        required
                        value={profileFirstName}
                        onChange={(e) => setProfileFirstName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-extrabold text-gray-500">Last name *</label>
                      <input
                        type="text"
                        value={profileLastName}
                        onChange={(e) => setProfileLastName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-extrabold text-gray-500">Display name *</label>
                    <input
                      type="text"
                      required
                      value={profileDisplayName}
                      onChange={(e) => setProfileDisplayName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                    />
                    <span className="block text-[10px] text-[#ff5c00] font-bold leading-normal">
                      This will be how your name will be displayed in the account section and in reviews
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-extrabold text-gray-500">Email address *</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                    />
                  </div>

                  {/* Password Change Subfield */}
                  <div className="border-t border-gray-100 pt-5 mt-5 space-y-4">
                    <h4 className="font-sans font-extrabold text-sm text-gray-800 uppercase tracking-wide">
                      Password change
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase font-extrabold text-gray-400">Current password (leave blank to leave unchanged)</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase font-extrabold text-gray-400">New password (leave blank to leave unchanged)</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase font-extrabold text-gray-400">Confirm new password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#ff5c00] hover:bg-[#cc4a00] text-white font-extrabold text-xs py-3 px-6 rounded-md tracking-wider uppercase transition-all shadow-sm cursor-pointer"
                  >
                    SAVE CHANGES
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
