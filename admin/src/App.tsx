import React, { useState, useEffect } from 'react';
import AdminPanel from './components/AdminPanel';
import { supabase, checkSupabaseConnection, getSupabaseConnectionError } from './lib/supabase';
import { Lock, Mail, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Login Form States
  const [email, setEmail] = useState<string>('admin@rupan.com');
  const [password, setPassword] = useState<string>('admin123');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    // 1. Verify Supabase connection
    const checkConnection = async () => {
      try {
        const errMsg = await getSupabaseConnectionError();
        setIsSupabaseOnline(errMsg === null);
        setConnectionError(errMsg);
      } catch (err: any) {
        setIsSupabaseOnline(false);
        setConnectionError(err?.message || String(err));
      }
    };
    checkConnection();
  }, []);

  useEffect(() => {
    // 2. Listen to Auth state changes
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        await loadUserProfile(currentSession.user.id, currentSession.user.email);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Check current session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        await loadUserProfile(currentSession.user.id, currentSession.user.email);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseOnline]);

  const loadUserProfile = async (userId: string, email?: string) => {
    try {
      if (isSupabaseOnline) {
        // Query profile from Supabase
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error || !profileData) {
          console.warn("Could not find user profile in DB, creating customer profile...", error);
          // Auto create profile fallback
          const newProfile = {
            id: userId,
            email: email || '',
            full_name: email?.split('@')[0] || 'Staff Member',
            role: email === 'admin@rupan.com' ? 'Super Admin' : 'Customer',
            is_active: true
          };
          
          await supabase.from('profiles').insert([newProfile]);
          setProfile(newProfile);
        } else {
          setProfile(profileData);
        }
      } else {
        // Mock fallback profile load
        const usersTable = (supabase as any).auth?.localDB?.getTable('users') || [];
        const mockUser = usersTable.find((u: any) => u.id === userId || u.email === email);
        setProfile(mockUser || {
          id: userId,
          email: email || 'admin@rupan.com',
          full_name: 'Sajjad Rupan (Demo)',
          role: 'Super Admin',
          is_active: true
        });
      }
    } catch (e) {
      console.error("Error loading user profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg('');
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        setErrorMsg(error.message);
        setAuthLoading(false);
        return;
      }

      // Profile will load via onAuthStateChange listener
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during login.');
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setLoading(false);
  };

  // If loading session, show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-[#ff5c00] animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Verifying Credentials...</p>
      </div>
    );
  }

  // Verify Roles
  const isAuthorized = profile && [
    'Super Admin', 'Admin', 'Manager', 'Editor', 'Support', 'Delivery Manager'
  ].includes(profile.role) && profile.is_active;

  // Show Admin Panel if logged in and authorized
  if (session && isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Render standalone dashboard, passing logout trigger */}
        <AdminPanel onClose={handleLogout} isSupabaseOnline={isSupabaseOnline} />
      </div>
    );
  }

  // Otherwise, show Login Screen
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[150px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#ff5c00]/10 blur-[150px]"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl relative z-10">
        
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 bg-[#ff5c00]/10 border border-[#ff5c00]/20 px-3 py-1 rounded-full text-[10px] font-bold text-[#ff5c00] uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Rupan Management Hub
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase mt-2">
            RUPAN<span className="text-[#ff5c00]">.</span>ADMIN
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to synchronize products, fulfill order invoices, and configure advertising pixels.
          </p>
        </div>

        {/* Database Status Tag */}
        <div className="flex flex-col items-center justify-center space-y-2">
          {isSupabaseOnline ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Database Mode
            </span>
          ) : (
            <div className="flex flex-col items-center space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-900 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Demo Fallback Mode
              </span>
              {connectionError && (
                <p className="text-[10px] text-amber-500/80 text-center max-w-xs leading-normal font-medium bg-amber-950/20 border border-amber-900/30 px-3 py-1.5 rounded-xl">
                  Error: {connectionError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Access Denied Alert */}
        {session && !isAuthorized && (
          <div className="bg-red-950/50 border border-red-900/60 p-4 rounded-2xl flex items-start space-x-3 text-red-300">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider">Access Restrained</p>
              <p className="text-[11px] text-red-300/80 leading-relaxed">
                Your account ({profile.email}) is registered as a customer or is deactivated. This panel is reserved for authorized staff.
              </p>
              <button 
                onClick={handleLogout} 
                className="text-[10px] font-bold uppercase underline tracking-wider text-white hover:text-red-300 pt-1"
              >
                Sign In with Another Account
              </button>
            </div>
          </div>
        )}

        {/* Login Form */}
        {(!session || (session && !isAuthorized)) && (
          <form onSubmit={handleLogin} className="space-y-4">
            
            {errorMsg && (
              <div className="bg-red-950/40 border border-red-900/40 px-4 py-2.5 rounded-xl text-red-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staff Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@myrupan.com"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#ff5c00] rounded-xl px-4 py-3 text-sm text-white focus:outline-none pl-10"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#ff5c00] rounded-xl px-4 py-3 text-sm text-white focus:outline-none pl-10"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#ff5c00] hover:bg-orange-600 disabled:bg-orange-800/50 text-white font-bold text-sm py-3.5 rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing...</span>
                </>
              ) : (
                <span>Access Console</span>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
