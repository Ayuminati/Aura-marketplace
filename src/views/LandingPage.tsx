
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Shield, ShoppingBag, Truck, Store, Layers, Globe, Zap } from 'lucide-react';
import Logo from '../components/Logo';

const LandingPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');

  const roles = [
    { type: UserRole.CUSTOMER, icon: <ShoppingBag />, label: 'Consumer', color: 'bg-indigo-500' },
    { type: UserRole.VENDOR, icon: <Store />, label: 'Merchant', color: 'bg-violet-500' },
    { type: UserRole.RIDER, icon: <Truck />, label: 'Fleet', color: 'bg-emerald-500' },
    { type: UserRole.ADMIN, icon: <Shield />, label: 'Operator', color: 'bg-slate-900' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/40 rounded-full blur-[100px]" />
      </div>

      <nav className="relative z-10 px-4 py-6 md:px-12 md:py-8 flex justify-between items-center max-w-7xl mx-auto">
        <Logo size={36} />
        <div className="flex items-center space-x-4">
          <button className="hidden sm:block text-sm font-bold text-slate-500 hover:text-indigo-600 px-4">Solutions</button>
          <button className="bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
            Enterprise
          </button>
        </div>
      </nav>

      <main className="relative z-10 pt-8 pb-20 md:pt-16 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Release 2.5 Active</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-950 mb-6 leading-[0.9] tracking-tighter">
            Commerce <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">Integrated.</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Unified infrastructure for the modern marketplace. Scaling local trade through intelligent logistics and AI-driven growth.
          </p>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-2 rounded-3xl shadow-2xl border border-slate-100 mb-16">
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="flex-1 px-6 py-4 rounded-2xl border-none bg-slate-50 sm:bg-transparent focus:ring-0 text-slate-900 placeholder:text-slate-400 font-medium outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.type}
                      onClick={() => login(email || 'demo@aura.com', r.type)}
                      className="group relative flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-50 transition-all duration-300 border border-transparent hover:border-slate-100"
                    >
                      <div className="text-slate-400 group-hover:scale-110 group-hover:text-indigo-600 transition-all mb-1">
                        {React.cloneElement(r.icon as React.ReactElement<any>, { size: 20 })}
                      </div>
                      <span className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 text-left px-4">
              {[
                { title: 'Global Sync', desc: 'Real-time state management across all endpoints.', icon: <Globe size={20} className="text-indigo-500" /> },
                { title: 'Smart Fleet', desc: 'AI route optimization for logistics partners.', icon: <Zap size={20} className="text-violet-500" /> },
                { title: 'Safe Trade', desc: 'Encrypted escrow and automated dispute handling.', icon: <Shield size={20} className="text-emerald-500" /> }
              ].map((f, i) => (
                <div key={i} className="bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">{f.icon}</div>
                  <h3 className="font-black text-slate-900 mb-1 text-sm uppercase tracking-tight">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-100 bg-white/80 backdrop-blur-md py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
          <div className="flex items-center space-x-4 opacity-50">
             <Logo size={24} hideText />
             <span className="text-xs font-bold text-slate-400">© 2025 AURA TECH</span>
          </div>
          <div className="flex space-x-8 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Legal</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Infrastructure</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
