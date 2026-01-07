
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getProducts,
  getOrders,
  createOrder,
  verifyAndCompleteOrder
} from "../services/api";
import { ShieldCheck, LogOut, ShoppingBag, Users, Layers, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { Order } from '../types';
import Logo from '../components/Logo';

const AdminView: React.FC = () => {
  const { logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const data = await getProducts();
    setStats(data);
    setIsLoading(false);
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black tracking-tighter text-indigo-600 animate-pulse">SYNCING PLATFORM CORE...</div>;

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex w-72 bg-slate-950 text-white flex-col p-8 sticky top-0 h-screen shrink-0">
        <Logo size={40} light className="mb-12" />
        <nav className="flex-1 space-y-2">
          {['Dashboard', 'Infrastructure', 'Global Ops', 'Security'].map((item, i) => (
            <button key={item} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-indigo-600' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
              <span>{item}</span>
              {i === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
            </button>
          ))}
        </nav>
        <button onClick={logout} className="mt-auto flex items-center justify-center space-x-3 px-6 py-3 text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-950/20 rounded-xl transition-all">
          <LogOut size={16} />
          <span>Shutdown Session</span>
        </button>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-slate-950 text-white p-6 flex justify-between items-center sticky top-0 z-40">
        <Logo size={32} light />
        <button onClick={logout} className="p-2 text-red-400"><LogOut size={20} /></button>
      </header>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
              <ShieldCheck size={14} /> System Governance Active
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter leading-none">Global Control.</h1>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Integrity</p>
              <p className="text-sm font-bold text-slate-900">100% Secure</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-10 md:mb-16">
          {[
            { label: 'Platform Users', val: stats.totalUsers, icon: <Users /> },
            { label: 'Gross Volume', val: `$${stats.totalSales.toFixed(2)}`, icon: <TrendingUp /> },
            { label: 'Active SKUs', val: stats.totalProducts, icon: <Layers /> },
            { label: 'System Orders', val: stats.totalOrders, icon: <ShoppingBag /> }
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-40 md:h-48 group hover:border-indigo-100 hover:shadow-xl transition-all">
              <div className="w-10 h-10 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-xl flex items-center justify-center transition-colors">
                {React.cloneElement(s.icon as any, { size: 20 })}
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <h3 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tighter">{s.val}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-xl md:text-2xl font-black text-slate-950 tracking-tighter flex items-center gap-3">
              <Clock className="text-indigo-600" /> Recent Activity
            </h4>
            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All Ledger</button>
          </div>
          
          <div className="space-y-3">
            {stats.recentOrders.length === 0 && <p className="text-center py-20 text-slate-300 font-black uppercase text-[10px]">No ledger entries</p>}
            {stats.recentOrders.map((o: Order) => (
              <div key={o.id} className="group flex justify-between items-center p-5 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all">
                <div className="flex items-center gap-5">
                  <div className="hidden sm:flex w-12 h-12 bg-white rounded-xl items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-black text-slate-900">{o.id}</p>
                      <span className="text-[8px] font-black px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full uppercase tracking-tighter">{o.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-6">
                  <div className="hidden md:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</p>
                    <p className="text-lg font-black text-slate-950 tracking-tighter">${o.totalAmount.toFixed(2)}</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminView;
