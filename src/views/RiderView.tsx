
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getOrders,
  updateOrderStatus,
  verifyAndCompleteOrder
} from "../services/api";
import { MapPin, Navigation, CheckCircle2, Phone, LogOut, Package, Clock, ShieldAlert, X, Map as MapIcon, Compass, ChevronRight } from 'lucide-react';
import { Order, OrderStatus } from '../types';

const RiderView: React.FC = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    refreshOrders();
  }, []);

  const refreshOrders = async () => {
    setIsLoading(true);
    const allOrders = await getOrders();
    const relevant = allOrders.filter(o => 
      o.status === OrderStatus.PAID || (o.riderId === user?.id && o.status !== OrderStatus.DELIVERED)
    );
    setOrders(relevant);
    setIsLoading(false);
  };

  const handleClaim = async (id: string) => {
    if (!user) return;
    await updateOrderStatus(id, OrderStatus.ASSIGNED, user.id);
    refreshOrders();
  };

  const handlePickUp = async (id: string) => {
    await updateOrderStatus(id, OrderStatus.PICKED_UP);
    refreshOrders();
  };

  const startVerification = (id: string) => {
    setVerifyingOrderId(id);
    setOtpInput('');
    setErrorMsg('');
  };

  const handleVerify = async () => {
    if (!verifyingOrderId || otpInput.length !== 4) return;
    setIsVerifying(true);
    const success = await verifyAndCompleteOrder(verifyingOrderId, otpInput);
    if (success) {
      setVerifyingOrderId(null);
      refreshOrders();
    } else {
      setErrorMsg('Incorrect OTP. Please verify with the customer.');
    }
    setIsVerifying(false);
  };

  const activeOrder = orders.find(o => o.riderId === user?.id && o.status !== OrderStatus.DELIVERED);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col">
      <header className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0a0c10]/80 backdrop-blur-xl z-20">
        <div>
          <h1 className="text-xl font-black tracking-tighter">AURA <span className="text-indigo-500 italic">FLEET</span></h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Node Cluster Active</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
             className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
           >
             {viewMode === 'list' ? <MapIcon size={14} /> : <Package size={14} />}
             <span>{viewMode === 'list' ? 'View Map' : 'View Tasks'}</span>
           </button>
           <button onClick={logout} className="p-2.5 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 transition-all"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-6 md:p-12 max-w-6xl mx-auto w-full space-y-8 pb-32">
        {viewMode === 'map' && activeOrder ? (
          <div className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500"><Compass size={32} className="animate-spin" style={{ animationDuration: '4s' }} /></div>
                   <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Navigating to</p>
                      <h3 className="text-2xl font-black italic">{activeOrder.deliveryAddress}</h3>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="text-center px-6 border-r border-white/10">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Distance</p>
                      <p className="text-xl font-black text-indigo-400">1.2 km</p>
                   </div>
                   <div className="text-center px-6">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Arrival</p>
                      <p className="text-xl font-black text-emerald-400">4 mins</p>
                   </div>
                </div>
             </div>

             {/* Stylized Visual Map */}
             <div className="relative flex-1 bg-slate-900 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl min-h-[400px]">
                {/* Visual Grid Lines */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
                
                {/* Route Path */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                   <path d="M 100,100 L 400,250 L 800,450" fill="none" stroke="#6366f1" strokeWidth="6" strokeDasharray="12,8" className="animate-[dash_20s_linear_infinite]" />
                   <style>{`
                     @keyframes dash {
                       to { stroke-dashoffset: -200; }
                     }
                   `}</style>
                </svg>

                {/* Hub Point */}
                <div className="absolute top-[80px] left-[80px] group">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                      <Package size={24} />
                   </div>
                   <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-slate-900 whitespace-nowrap shadow-xl">AURA HUB CENTER</div>
                </div>

                {/* Rider Point (Animated) */}
                <div className="absolute top-[230px] left-[380px] z-10">
                   <div className="relative">
                      <div className="absolute -inset-4 bg-indigo-500/20 rounded-full animate-ping" />
                      <div className="w-10 h-10 bg-indigo-600 rounded-full border-4 border-[#0a0c10] flex items-center justify-center shadow-[0_0_20px_#6366f1]">
                         <Navigation size={18} className="rotate-45" />
                      </div>
                   </div>
                </div>

                {/* Destination Point */}
                <div className="absolute bottom-[80px] right-[80px] group">
                   <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <MapPin size={24} />
                   </div>
                   <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-emerald-500 px-3 py-1 rounded-lg text-[10px] font-black text-white whitespace-nowrap shadow-xl uppercase tracking-widest">Final Target</div>
                </div>
             </div>

             <div className="flex gap-4">
                {activeOrder.status === OrderStatus.ASSIGNED && (
                  <button onClick={() => handlePickUp(activeOrder.id)} className="flex-1 bg-white text-black py-5 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-indigo-600 hover:text-white transition-all">At Collection Point</button>
                )}
                {activeOrder.status === OrderStatus.PICKED_UP && (
                  <button onClick={() => startVerification(activeOrder.id)} className="flex-1 bg-emerald-500 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/20">Verify & Complete</button>
                )}
             </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] flex justify-between items-center shadow-2xl">
              <div>
                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">Fleet Dispatch</p>
                <h2 className="text-4xl font-black">{orders.length} <span className="text-lg opacity-60">Operations</span></h2>
              </div>
              <button onClick={refreshOrders} className="bg-white/20 p-4 rounded-full hover:scale-110 active:rotate-180 transition-all">
                <Clock size={28} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="grid gap-6">
              {orders.length === 0 && (
                <div className="text-center py-24 bg-white/5 border border-white/5 border-dashed rounded-[3rem]">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Waiting for regional demand.</p>
                </div>
              )}
              {orders.map((order) => (
                <div key={order.id} className="bg-white/5 border border-white/10 p-8 rounded-[3rem] space-y-8 hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all"><Package size={28} /></div>
                      <div>
                        <h4 className="text-xl font-bold tracking-tight">{order.id}</h4>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${order.status === OrderStatus.PAID ? 'text-amber-500' : 'text-indigo-400'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-emerald-400 tracking-tighter">${(order.totalAmount * 0.15).toFixed(2)}</p>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Commission</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-6 bg-black/40 rounded-3xl">
                     <div className="space-y-4 flex-1">
                        <div className="flex items-start gap-3">
                           <div className="w-2 h-2 rounded-full bg-white/20 mt-1.5" />
                           <div>
                              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Collect</p>
                              <p className="text-sm font-bold">Aura Hub Sector 4</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-3">
                           <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shadow-[0_0_10px_#6366f1]" />
                           <div>
                              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Destination</p>
                              <p className="text-sm font-bold">{order.deliveryAddress}</p>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center">
                        <ChevronRight className="text-white/10 group-hover:text-white transition-all" size={32} />
                     </div>
                  </div>

                  <div className="flex gap-3">
                    {order.status === OrderStatus.PAID && (
                      <button onClick={() => handleClaim(order.id)} className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all">Accept Logistics Task</button>
                    )}
                    {order.status === OrderStatus.ASSIGNED && (
                      <button onClick={() => setViewMode('map')} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <MapIcon size={16} /> Open Nav & Start
                      </button>
                    )}
                    {order.status === OrderStatus.PICKED_UP && (
                      <button onClick={() => setViewMode('map')} className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <MapIcon size={16} /> Track on Map
                      </button>
                    )}
                    <button className="bg-white/5 p-4 rounded-2xl border border-white/5"><Phone size={24} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Verification Modal */}
      {verifyingOrderId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0a0c10]/98 backdrop-blur-2xl">
          <div className="bg-white text-black w-full max-w-sm rounded-[3rem] p-10 space-y-8 flex flex-col items-center shadow-2xl">
            <div className="bg-indigo-50 p-6 rounded-full text-indigo-600"><ShieldAlert size={56} /></div>
            <div className="text-center">
              <h3 className="text-3xl font-black tracking-tighter italic mb-2">Order Lock</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">Verify the 4-digit code provided to the customer to finalize the transaction.</p>
            </div>

            <input 
              type="text" 
              maxLength={4} 
              autoFocus
              className="w-full text-center text-6xl font-black tracking-[0.4em] bg-slate-50 border-none py-8 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none text-slate-900 placeholder:opacity-10"
              placeholder="0000"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
            />
            {errorMsg && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{errorMsg}</p>}

            <div className="w-full flex flex-col gap-3">
              <button onClick={handleVerify} disabled={isVerifying || otpInput.length !== 4} className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest disabled:opacity-20 transition-all active:scale-95 shadow-xl shadow-slate-200">Verify & Complete</button>
              <button onClick={() => setVerifyingOrderId(null)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#0a0c10]/95 backdrop-blur-md border-t border-white/5 px-10 py-5 flex justify-around items-center z-40">
        <button onClick={() => setViewMode('list')} className={`flex flex-col items-center gap-1 ${viewMode === 'list' ? 'text-indigo-500' : 'text-white/30'}`}><Package size={22} /><span className="text-[8px] font-black tracking-widest">TASKS</span></button>
        <button onClick={() => activeOrder && setViewMode('map')} className={`flex flex-col items-center gap-1 ${viewMode === 'map' ? 'text-indigo-500' : 'text-white/30'} ${!activeOrder ? 'opacity-20 cursor-not-allowed' : ''}`}><MapIcon size={22} /><span className="text-[8px] font-black tracking-widest">ROUTE</span></button>
        <button className="flex flex-col items-center gap-1 text-white/30"><CheckCircle2 size={22} /><span className="text-[8px] font-black tracking-widest">LEDGER</span></button>
      </nav>
    </div>
  );
};

export default RiderView;
