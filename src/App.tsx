import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Map as MapIcon, 
  Upload, 
  LayoutDashboard, 
  Bell, 
  User, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Megaphone,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { auth, db } from './lib/firebase';
import { loginWithGoogle, logout, subscribeToAuth, UserProfile, getUserProfile } from './services/authService';
import { Button } from './components/UI';
import { motion, AnimatePresence } from 'motion/react';

// Lazy load views
const CitizenView = React.lazy(() => import('./views/CitizenView'));
const GovernmentView = React.lazy(() => import('./views/GovernmentView'));
const SpatialExplorer = React.lazy(() => import('./views/SpatialExplorer'));
const IntelligenceAlerts = React.lazy(() => import('./views/IntelligenceAlerts'));
const UrbanLabView = React.lazy(() => import('./views/UrbanLabView'));

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'citizen' | 'government' | 'spatial' | 'alerts' | 'lab'>('citizen');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loginRole, setLoginRole] = useState<UserProfile['role']>('citizen');

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const profile = await loginWithGoogle(loginRole);
      setUser(profile);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white visible-grid">
        <div className="flex flex-col items-center gap-4 bg-white p-8 border-2 border-slate-900 civic-shadow">
          <div className="h-10 w-10 border-4 border-civic-accent border-t-slate-900 rounded-full animate-spin"></div>
          <p className="mono-label tracking-[0.3em]">System.Initialize</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white visible-grid flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md bg-white border-4 border-slate-900 p-10 civic-shadow"
        >
          <div className="mb-8 flex justify-center">
            <div className="h-20 w-20 bg-civic-accent border-2 border-slate-900 flex items-center justify-center shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
              <Megaphone className="h-10 w-10 text-slate-900" />
            </div>
          </div>
          <h1 className="text-5xl font-bold font-display text-slate-900 mb-2 tracking-tight">ನಮ್ಮ OORU</h1>
          <p className="mono-label mb-4">Civic Intelligence Platform</p>
          
          <div className="bg-slate-50 p-4 border-2 border-slate-900 mb-8 flex flex-col gap-2">
            <p className="text-[10px] font-mono uppercase font-black text-slate-400 text-left">Select Login Persona</p>
            <div className="flex gap-2">
              {(['citizen', 'official'] as UserProfile['role'][]).map(role => (
                <button
                  key={role}
                  onClick={() => setLoginRole(role)}
                  className={`flex-1 py-2 font-mono text-[10px] uppercase font-black border-2 transition-all ${loginRole === role ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <p className="text-slate-600 mb-10 leading-relaxed font-medium">
            Bridging the gap between Bangalore's citizens and governance through real-time AI street analytics.
          </p>
          <Button onClick={handleLogin} variant="primary" size="lg" className="w-full gap-3">
            <User className="h-5 w-5" />
            Sign In with Google
          </Button>
          <div className="mt-10 pt-6 border-t border-slate-200">
            <p className="text-xs font-mono uppercase font-bold text-slate-400">
              Piloting in Bangalore & Mysore
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-1 items-center">
              <p className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">© 2026 ನಮ್ಮ OORU</p>
              <p className="text-[9px] font-mono text-slate-300 uppercase tracking-widest italic opacity-50">Dedicated to my sensei Jaka</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const isOfficial = user.role === 'official' || user.role === 'admin';

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b-2 border-slate-900 z-50">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xl tracking-tighter">ನಮ್ಮ <span className="text-civic-accent">OORU</span></span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar Navigation Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <AnimatePresence mode="wait">
        {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <motion.aside
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed md:relative z-50 h-full w-[300px] bg-white border-r-4 border-slate-900 flex flex-col overflow-y-auto ${sidebarOpen ? 'left-0' : '-left-full md:left-0'}`}
          >
            <div className="p-8 border-b-2 border-slate-900 flex items-center justify-between bg-civic-dark text-white">
              <div className="flex flex-col">
                <span className="font-display font-bold text-3xl tracking-tighter leading-none">ನಮ್ಮ</span>
                <span className="font-display font-bold text-3xl tracking-tighter leading-none text-civic-accent">OORU</span>
              </div>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            <nav className="flex-1 p-6 space-y-4">
              <p className="mono-label mb-6">Directory</p>
              
              <button 
                onClick={() => { setActiveTab('citizen'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-4 border-2 transition-all group ${activeTab === 'citizen' ? 'bg-civic-accent border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)]' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                <div className={`p-2 rounded border-2 ${activeTab === 'citizen' ? 'bg-white border-slate-900' : 'bg-slate-100 border-slate-200 group-hover:border-slate-300'}`}>
                  <Home className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm uppercase tracking-widest leading-none">Neighborhood Feed</span>
              </button>

              {isOfficial && (
                <button 
                  onClick={() => { setActiveTab('government'); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-4 border-2 transition-all group ${activeTab === 'government' ? 'bg-civic-accent border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)]' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                >
                  <div className={`p-2 rounded border-2 ${activeTab === 'government' ? 'bg-white border-slate-900' : 'bg-slate-100 border-slate-200 group-hover:border-slate-300'}`}>
                    <LayoutDashboard className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm uppercase tracking-widest leading-tight text-left">Govt Command Center</span>
                </button>
              )}

              <p className="mono-label pt-10 mb-6">Data Tools</p>
              
              <button 
                onClick={() => { setActiveTab('lab'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-4 border-2 transition-all group ${activeTab === 'lab' ? 'bg-civic-accent border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)]' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                <div className={`p-2 rounded border-2 ${activeTab === 'lab' ? 'bg-white border-slate-900' : 'bg-slate-100 border-slate-200 group-hover:border-slate-300'}`}>
                  <Zap className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm uppercase tracking-widest text-left">Urban Intelligence Lab</span>
              </button>

              <button 
                onClick={() => { setActiveTab('spatial'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-4 border-2 transition-all group ${activeTab === 'spatial' ? 'bg-civic-accent border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)]' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                <div className={`p-2 rounded border-2 ${activeTab === 'spatial' ? 'bg-white border-slate-900' : 'bg-slate-100 border-slate-200 group-hover:border-slate-300'}`}>
                  <MapIcon className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm uppercase tracking-widest text-left">Spatial Explorer</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab('alerts'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-4 border-2 transition-all group ${activeTab === 'alerts' ? 'bg-civic-accent border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)]' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                <div className={`p-2 rounded border-2 ${activeTab === 'alerts' ? 'bg-white border-slate-900' : 'bg-slate-100 border-slate-200 group-hover:border-slate-300'}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm uppercase tracking-widest text-left">Intelligence Alerts</span>
              </button>
            </nav>

            <div className="p-6 border-t-2 border-slate-900 bg-slate-50 mt-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] bg-civic-accent flex items-center justify-center font-bold text-lg">
                  {user.displayName?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase tracking-tight truncate">{user.displayName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ShieldCheck className="h-3 w-3 text-civic-accent fill-civic-accent" />
                    <span className="text-[11px] text-slate-500 uppercase font-black tracking-widest">{user.role}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full justify-start gap-3 bg-white mb-4" onClick={logout}>
                <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-500" />
                Log Out
              </Button>
              
              <div className="pt-4 border-t border-slate-200 flex flex-col gap-1">
                <p className="text-[8px] font-mono text-slate-400 uppercase tracking-[0.2em]">© 2026 NAMMA OORU</p>
                <p className="text-[8px] font-mono text-slate-400 uppercase tracking-[0.1em] opacity-40 italic font-medium">Dedicated to my sensei Jaka</p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden visible-grid relative pb-[72px] md:pb-0">
        <React.Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="h-8 w-8 border-3 border-civic-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 md:pb-0">
              {activeTab === 'citizen' && <CitizenView user={user} />}
              {activeTab === 'government' && <GovernmentView user={user} onBack={() => setActiveTab('citizen')} />}
              {activeTab === 'spatial' && <SpatialExplorer onBack={() => setActiveTab('citizen')} />}
              {activeTab === 'alerts' && <IntelligenceAlerts user={user} onBack={() => setActiveTab('citizen')} />}
              {activeTab === 'lab' && <UrbanLabView user={user} onBack={() => setActiveTab('citizen')} />}
              
              <footer className="p-8 border-t-2 border-slate-900 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-center md:items-start gap-1">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em]">© 2026 NAMMA OORU / ALL SYSTEMS OPERATIONAL</p>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.1em] opacity-40 italic">Dedicated to my sensei Jaka</p>
                </div>
                <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-civic-accent"></div>
                </div>
              </footer>
            </div>
          </div>
        </React.Suspense>

        {/* Bottom Navigation for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t-4 border-slate-900 z-50 flex items-center justify-around px-2 md:hidden civic-shadow">
          <MobileNavButton 
            active={activeTab === 'citizen'} 
            onClick={() => setActiveTab('citizen')} 
            icon={<Home size={20} />} 
            label="Feed" 
          />
          <MobileNavButton 
            active={activeTab === 'spatial'} 
            onClick={() => setActiveTab('spatial')} 
            icon={<MapIcon size={20} />} 
            label="Map" 
          />
          <MobileNavButton 
            active={activeTab === 'lab'} 
            onClick={() => setActiveTab('lab')} 
            icon={<Zap size={20} />} 
            label="Lab" 
          />
          <MobileNavButton 
            active={activeTab === 'alerts'} 
            onClick={() => setActiveTab('alerts')} 
            icon={<Bell size={20} />} 
            label="Alerts" 
          />
        </div>
      </main>
    </div>
  );
}

function MobileNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 transition-all px-4 h-full ${active ? 'text-slate-900 scale-110' : 'text-slate-400'}`}
    >
      <div className={`p-1.5 rounded-lg border-2 transition-all ${active ? 'bg-civic-accent border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]' : 'border-transparent'}`}>
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      {active && (
        <motion.div 
          layoutId="activeTabMobile"
          className="h-1 w-8 bg-slate-900 mt-0.5 rounded-full"
        />
      )}
    </button>
  );
}
