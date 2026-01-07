
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getProducts,
  getOrders,
  saveProduct,
  deleteProduct
} from "../services/api";
import { Product, Order, OrderStatus } from '../types';
import { Package, Plus, BarChart3, LogOut, Trash2, Sparkles, X, ShoppingBag, LayoutGrid, ChevronRight } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import Logo from '../components/Logo';

const VendorView: React.FC = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'stats'>('products');
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', description: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => { refreshData(); }, []);

  const refreshData = async () => {
    const [p, o] = await Promise.all([getProducts(), getOrders()]);
    setProducts(p.filter(item => item.vendorId === user?.id));
    setOrders(o.filter(item => item.vendorId === user?.id));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove product?")) return;
    await deleteProduct(id);
    refreshData();
  };

  const handleSaveProduct = async () => {
    if (!user || !newProduct.name || !newProduct.price) return;
    setIsProcessing(true);
    await saveProduct({
      id: '', vendorId: user.id, name: newProduct.name, description: newProduct.description,
      price: parseFloat(newProduct.price), category: newProduct.category || 'General',
      image: `https://picsum.photos/seed/${newProduct.name}/600/400`, stock: 50
    });
    setNewProduct({ name: '', price: '', category: '', description: '' });
    setIsAdding(false);
    setIsProcessing(false);
    refreshData();
  };

  const handleGenerateAI = async () => {
    if (!newProduct.name || !newProduct.category) return;
    setIsGenerating(true);
    const desc = await geminiService.generateProductDescription(newProduct.name, newProduct.category);
    setNewProduct(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const menuItems = [
    { id: 'products', label: 'Inventory', icon: <LayoutGrid size={20} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={20} /> },
    { id: 'stats', label: 'Metrics', icon: <BarChart3 size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col p-8 sticky top-0 h-screen">
        <Logo size={36} className="mb-12" />
        <nav className="flex-1 space-y-2">
          {menuItems.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-slate-950 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={logout} className="mt-auto flex items-center justify-center space-x-3 px-6 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all">
          <LogOut size={18} />
          <span className="text-sm">Disconnect</span>
        </button>
      </aside>

      {/* Header - Mobile Only */}
      <header className="md:hidden bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-40">
        <Logo size={32} />
        <button onClick={logout} className="p-2 text-red-500"><LogOut size={20} /></button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-end mb-8 md:mb-12">
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Verified Merchant</p>
            <h1 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tighter capitalize">{activeTab}</h1>
          </div>
          {activeTab === 'products' && (
            <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white w-12 h-12 md:w-auto md:px-6 md:py-3 rounded-2xl font-black flex items-center justify-center md:space-x-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              <Plus size={24} />
              <span className="hidden md:inline">New SKU</span>
            </button>
          )}
        </header>

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 gap-4">
            {products.length === 0 && <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold">Catalog empty.</div>}
            {products.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center space-x-4">
                  <img src={p.image} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-base leading-tight">{p.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">${p.price} • {p.stock} units</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(p.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="grid gap-4">
            {orders.length === 0 && <div className="text-center py-24 text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for sales.</div>}
            {orders.map(o => (
              <div key={o.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group">
                <div className="flex gap-4 items-center">
                  <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600"><ShoppingBag size={24} /></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{o.id}</span>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${o.status === OrderStatus.PAID ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>{o.status}</span>
                    </div>
                    <p className="font-black text-xl text-slate-950">${o.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Revenue', val: `$${orders.reduce((s,o)=>s+o.totalAmount,0).toFixed(2)}`, trend: '+12%', icon: <BarChart3 /> },
              { label: 'Orders', val: orders.length, trend: 'Optimal', icon: <ShoppingBag /> },
              { label: 'SKU Count', val: products.length, trend: 'Stable', icon: <LayoutGrid /> }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 text-center shadow-sm">
                 <div className="mx-auto w-10 h-10 bg-slate-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">{stat.icon}</div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                 <h2 className="text-3xl font-black text-slate-950 mb-3 tracking-tighter">{stat.val}</h2>
                 <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase">{stat.trend}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Nav - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-around items-center z-40">
        {menuItems.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            {tab.icon}
            <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Product Modal - Fully Responsive */}
      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl h-full md:h-auto overflow-y-auto rounded-3xl p-6 md:p-10 space-y-8 shadow-2xl border border-white">
            <header className="flex justify-between items-center">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">Inventory Sync</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X size={32} /></button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <input className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none text-slate-900 placeholder:text-slate-400" placeholder="Product Name" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} />
                <input className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none text-slate-900 placeholder:text-slate-400" placeholder="Category" value={newProduct.category} onChange={e=>setNewProduct({...newProduct, category: e.target.value})} />
                <input className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none text-slate-900 placeholder:text-slate-400" placeholder="Price (USD)" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} />
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Content</span>
                  <button onClick={handleGenerateAI} disabled={isGenerating} className="text-[10px] font-black bg-indigo-600 px-3 py-1.5 rounded-full disabled:opacity-30">
                    {isGenerating ? "Processing..." : "Auto-Fill"}
                  </button>
                </div>
                <textarea 
                  className="flex-1 w-full bg-white/5 border-none p-3 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-600 resize-none min-h-[120px]" 
                  placeholder="AI generated descriptions appear here..." 
                  value={newProduct.description} 
                  onChange={e=>setNewProduct({...newProduct, description: e.target.value})} 
                />
              </div>
            </div>
            <button 
              onClick={handleSaveProduct} 
              disabled={isProcessing}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 disabled:opacity-50"
            >
              {isProcessing ? "Deploying..." : "Confirm Publication"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorView;
