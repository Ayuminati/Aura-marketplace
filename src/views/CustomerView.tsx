
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  Search, ShoppingCart, LogOut, Bot, Sparkles, X, CheckCircle, 
  ShoppingBag, MapPin, ChevronRight, Package, ShieldCheck, 
  Minus, Plus, AlertCircle, Clock, Truck, CheckCircle2, User as UserIcon
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { getProducts, getOrders, createOrder } from "../services/api";
import { Product, Order, OrderStatus } from '../types';
import Logo from '../components/Logo';
import ProfileSection from './ProfileSection';

const CustomerView: React.FC = () => {
  const { user, logout } = useAuth();
  const { items, addToCart, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activeView, setActiveView] = useState<'market' | 'orders' | 'profile'>('market');
  const [assistantMsg, setAssistantMsg] = useState('Welcome back. Looking for something specific today?');
  const [assistantInput, setAssistantInput] = useState('');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
  setIsLoading(true);

  try {
    // 1️⃣ Always load products (critical for Market)
    const p = await getProducts();

    const normalizedProducts = p.map((prod: any) => ({
      id: prod._id,
      name: prod.name || prod.title,
      description: prod.description || "No description available",
      price: prod.price,
      image: prod.image || prod.imageUrl,
      category: prod.category || "General",
      stock: prod.stock ?? prod.quantity ?? 0,
      vendorId: prod.vendorId
    }));

    setProducts(normalizedProducts);

    // 2️⃣ Try orders separately (non-blocking)
    try {
      const o = await getOrders();
      setMyOrders(o.filter((ord: any) => ord.customerId === user?.id));
    } catch (err) {
      console.warn("Orders not available yet (safe to ignore)");
      setMyOrders([]);
    }

  } catch (err) {
    console.error("Failed to load products:", err);
  } finally {
    setIsLoading(false);
  }
};

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssistantAsk = async () => {
    if (!assistantInput.trim()) return;
    const q = assistantInput;
    setAssistantInput('');
    setAssistantMsg("Searching our collection...");
    const response = await geminiService.getShoppingAssistantResponse(q, products.map(p => p.name));
    setAssistantMsg(response);
  };

  const handleCheckout = async () => {
    if (!user || items.length === 0) return;
    setIsProcessingOrder(true);
    setCheckoutError(null);
    try {
      await createOrder({
        customerId: user.id,
        vendorId: items[0].vendorId,
        items: [...items],
        totalAmount: totalPrice,
        deliveryAddress: "Emerald Towers, Floor 22"
      });
      setIsOrderComplete(true);
      clearCart();
      loadData();
    } catch (error: any) {
      if (error.message === 'INSUFFICIENT_STOCK') {
        setCheckoutError("One or more items in your cart are no longer available in the requested quantity.");
      } else {
        setCheckoutError("System sync error. Please try again.");
      }
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID: return 1;
      case OrderStatus.ASSIGNED: return 2;
      case OrderStatus.PICKED_UP: return 3;
      case OrderStatus.DELIVERED: return 4;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-16 md:h-20 shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <Logo size={32} />
            <nav className="hidden md:flex space-x-6 text-xs font-black uppercase tracking-widest text-slate-400">
              <button onClick={() => setActiveView('market')} className={activeView === 'market' ? 'text-indigo-600' : 'hover:text-slate-900 transition-colors'}>Market</button>
              <button onClick={() => setActiveView('orders')} className={activeView === 'orders' ? 'text-indigo-600' : 'hover:text-slate-900 transition-colors'}>Order Center</button>
              <button onClick={() => setActiveView('profile')} className={activeView === 'profile' ? 'text-indigo-600' : 'hover:text-slate-900 transition-colors'}>Account</button>
            </nav>
          </div>
          
          <div className="flex-1 max-w-md hidden lg:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search collection..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-sm outline-none text-slate-900 placeholder:text-slate-400 font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-slate-50 rounded-xl hover:bg-white hover:border-slate-100 transition-all">
              <ShoppingCart size={20} className="text-slate-600" />
              {items.length > 0 && <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{items.length}</span>}
            </button>
            <button onClick={() => setActiveView('profile')} className="p-1 rounded-2xl border-2 border-slate-100 hover:border-indigo-600 transition-all overflow-hidden w-10 h-10 shadow-sm hidden md:block">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} className="w-full h-full object-cover" />
            </button>
            <button onClick={logout} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
        {activeView === 'profile' ? (
          <ProfileSection />
        ) : activeView === 'market' ? (
          <>
            <div className="mb-10">
              <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter mb-4">Discovery.</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'Premium', 'Lifestyle', 'Tech'].map(cat => (
                  <button key={cat} className="whitespace-nowrap px-6 py-2 rounded-full bg-white border border-slate-100 text-xs font-black uppercase tracking-widest hover:border-indigo-600 transition-all shadow-sm">
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => <div key={i} className="bg-slate-50 h-80 rounded-3xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {filteredProducts.map(product => {
                  const isOutOfStock = product.stock <= 0;
                  return (
                    <div key={product.id} className={`group bg-white rounded-[2rem] overflow-hidden border border-slate-100 transition-all flex flex-col ${isOutOfStock ? 'opacity-60' : 'hover:shadow-2xl hover:shadow-indigo-500/5'}`}>
                      <div className="h-64 bg-slate-50 relative overflow-hidden">
                        <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">Sold Out</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-900">{product.name}</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.stock} units</span>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-1">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black text-slate-950 tracking-tighter">${product.price.toFixed(2)}</span>
                          <button 
                            onClick={() => !isOutOfStock && addToCart(product)} 
                            disabled={isOutOfStock}
                            className={`p-3.5 rounded-2xl transition-all shadow-lg ${isOutOfStock ? 'bg-slate-100 text-slate-300' : 'bg-slate-950 text-white hover:bg-indigo-600'}`}
                          >
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-4xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-10">
              <div>
                <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter mb-2">My Orders.</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Track your current dispatches & history</p>
              </div>
              <div className="bg-white border border-slate-100 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Packages</p>
                  <p className="text-lg font-black text-indigo-600">{myOrders.filter(o => o.status !== OrderStatus.DELIVERED).length}</p>
                </div>
                <Package className="text-indigo-600" size={32} />
              </div>
            </header>

            {myOrders.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                  <ShoppingBag size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-950 mb-2">No dispatches found</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">Start shopping to see your orders here.</p>
                <button onClick={() => setActiveView('market')} className="bg-slate-950 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">Go to Market</button>
              </div>
            ) : (
              <div className="space-y-8">
                {myOrders.slice().reverse().map(order => {
                  const currentStep = getStatusStep(order.status);
                  return (
                    <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
                      <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8">
                        {/* Order Identity & Info */}
                        <div className="flex-1 space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                              <Package size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.id}</span>
                                {order.status !== OrderStatus.DELIVERED && (
                                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                )}
                              </div>
                              <h4 className="text-xl font-bold text-slate-900 leading-tight">
                                {order.items.length} Product{order.items.length > 1 ? 's' : ''} • ${order.totalAmount.toFixed(2)}
                              </h4>
                            </div>
                          </div>

                          {/* Progress Stepper */}
                          <div className="relative pt-6 pb-2">
                            <div className="absolute top-[34px] left-0 w-full h-1 bg-slate-100 rounded-full" />
                            <div 
                              className="absolute top-[34px] left-0 h-1 bg-indigo-600 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                            />
                            <div className="relative flex justify-between">
                              {[
                                { icon: <Clock size={14} />, label: 'Placed' },
                                { icon: <Package size={14} />, label: 'Assigned' },
                                { icon: <Truck size={14} />, label: 'En-route' },
                                { icon: <CheckCircle2 size={14} />, label: 'Delivered' }
                              ].map((step, idx) => (
                                <div key={idx} className="flex flex-col items-center space-y-3 z-10">
                                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${currentStep >= idx + 1 ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-300'}`}>
                                    {step.icon}
                                  </div>
                                  <span className={`text-[8px] font-black uppercase tracking-widest ${currentStep >= idx + 1 ? 'text-indigo-600' : 'text-slate-300'}`}>{step.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* OTP Security Card */}
                        {order.status !== OrderStatus.DELIVERED ? (
                          <div className="md:w-64 bg-slate-950 text-white p-8 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4 shadow-2xl">
                            <ShieldCheck size={40} className="text-indigo-400 mb-2" />
                            <div>
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Verification Key</p>
                              <span className="text-4xl font-black tracking-[0.3em] font-mono">{order.otp}</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">
                              Required for secure hand-off.<br/>Provide this to your rider.
                            </p>
                          </div>
                        ) : (
                          <div className="md:w-64 bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4">
                            <CheckCircle size={48} className="text-emerald-500" />
                            <h5 className="font-black text-emerald-900 text-sm uppercase tracking-widest">Transaction Verified</h5>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase">Success Fully Completed</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center">
                         <div className="flex items-center gap-2">
                           <MapPin size={12} className="text-slate-400" />
                           <span className="text-[10px] font-bold text-slate-500">{order.deliveryAddress}</span>
                         </div>
                         <span className="text-[10px] font-bold text-slate-400">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* AI Assistant Button */}
      <button onClick={() => setIsAssistantOpen(true)} className="fixed bottom-24 md:bottom-10 right-6 md:right-10 bg-indigo-600 text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-30 animate-pulse">
        <Bot size={28} />
      </button>

      {/* AI Assistant Modal */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white w-full h-full md:h-auto md:max-w-lg md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 md:p-8 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Sparkles size={24} className="text-indigo-400" />
                <h3 className="font-black text-lg uppercase tracking-widest">Aura Intelligence</h3>
              </div>
              <button onClick={() => setIsAssistantOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50 min-h-[400px]">
              <div className="bg-white p-6 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm max-w-[85%] text-sm font-medium text-slate-900 leading-relaxed">
                {assistantMsg}
              </div>
            </div>
            <div className="p-6 bg-white border-t border-slate-100 flex space-x-2">
              <input 
                className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold outline-none text-slate-900 placeholder:text-slate-400" 
                placeholder="Ask Aura..." 
                value={assistantInput} 
                onChange={(e) => setAssistantInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleAssistantAsk()} 
              />
              <button onClick={handleAssistantAsk} className="bg-indigo-600 text-white p-3.5 rounded-2xl"><Bot size={20} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50" onClick={() => setIsCartOpen(false)} />
          <div className="fixed inset-y-0 right-0 h-full w-full sm:max-w-md bg-white z-[60] shadow-2xl flex flex-col p-6 md:p-10 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black text-slate-950 tracking-tighter uppercase">My Cart</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={32} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-200">
                  <ShoppingBag size={64} strokeWidth={1} />
                  <p className="mt-4 font-black uppercase text-[10px] tracking-widest">Inventory empty</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                    <img src={item.image} className="w-16 h-16 rounded-xl object-cover bg-slate-200" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">{item.name}</h4>
                      <div className="flex items-center space-x-3">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><Minus size={12} /></button>
                        <span className="text-xs font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><Plus size={12} /></button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-950">${(item.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-1 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-8 border-t border-slate-100 mt-auto">
              {checkoutError && (
                <div className="mb-4 p-4 bg-red-50 rounded-2xl flex items-start gap-3 text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{checkoutError}</p>
                </div>
              )}
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Bill</p>
                  <p className="text-4xl font-black text-slate-950">${totalPrice.toFixed(2)}</p>
                </div>
              </div>
              <button 
                onClick={handleCheckout} 
                disabled={isProcessingOrder || items.length === 0} 
                className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                {isProcessingOrder ? "Securing Funds..." : "Complete Order"}
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </>
      )}

      {isOrderComplete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl">
          <div className="bg-white p-12 rounded-[3rem] max-w-sm w-full text-center shadow-2xl border border-white">
            <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Order Synced</h3>
            <p className="text-slate-500 font-medium mb-8">Inventory adjusted and rider assigned.</p>
            <button onClick={() => { setIsOrderComplete(false); setActiveView('orders'); }} className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Live Tracking</button>
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 px-8 py-4 flex justify-around items-center z-40">
        <button onClick={() => setActiveView('market')} className={`flex flex-col items-center gap-1 ${activeView === 'market' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <ShoppingBag size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Shop</span>
        </button>
        <button onClick={() => setActiveView('orders')} className={`flex flex-col items-center gap-1 ${activeView === 'orders' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Package size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Orders</span>
        </button>
        <button onClick={() => setActiveView('profile')} className={`flex flex-col items-center gap-1 ${activeView === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <UserIcon size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Me</span>
        </button>
      </nav>
    </div>
  );
};

export default CustomerView;
