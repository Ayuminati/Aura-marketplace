
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  User as UserIcon, Mail, Phone, MapPin, Calendar, 
  CreditCard, Shield, Settings, LogOut, Plus, 
  ChevronRight, ArrowRightLeft, Trash2, Camera 
} from 'lucide-react';

const ProfileSection: React.FC = () => {
  const { user, accounts, switchAccount, removeAccount, login, logout } = useAuth();
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter mb-2">Profile.</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Manage your identities & settings</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
          <LogOut size={16} /> Close Session
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Identity Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
              <div className="relative group">
                <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <button className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg hover:scale-110 transition-transform">
                  <Camera size={16} />
                </button>
              </div>
              <div className="text-center md:text-left space-y-2">
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                  <h3 className="text-3xl font-black text-slate-950 tracking-tight">{user.name}</h3>
                  <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{user.role}</span>
                </div>
                <p className="text-slate-500 font-medium max-w-sm">{user.bio}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: <Mail size={18} />, label: 'Email', value: user.email },
                { icon: <Phone size={18} />, label: 'Phone', value: user.phone },
                { icon: <MapPin size={18} />, label: 'Region', value: user.location },
                { icon: <Calendar size={18} />, label: 'Joined', value: new Date(user.joinedAt || '').toLocaleDateString() }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="text-sm font-bold text-slate-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Specific Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between h-56">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><CreditCard /></div>
                <Settings size={20} className="text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aura Balance</p>
                <h3 className="text-4xl font-black">${user.balance?.toFixed(2) || '0.00'}</h3>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between h-56 group hover:border-indigo-100 transition-all">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Shield /></div>
                <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Infrastructure</p>
                <h3 className="text-2xl font-black text-slate-950 tracking-tight">Security & Keys</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">2FA & Recovery options</p>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Account Switching Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest">My Network</h4>
              <button 
                onClick={() => setIsAddingAccount(true)}
                className="p-2 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {accounts.map((acc) => (
                <div 
                  key={`${acc.id}-${acc.role}`}
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${user.id === acc.id && user.role === acc.role ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                >
                  <button 
                    onClick={() => switchAccount(acc.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${acc.email}`} alt="Avatar" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900">{acc.name}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{acc.role}</p>
                    </div>
                  </button>
                  {accounts.length > 1 && (
                    <button 
                      onClick={() => removeAccount(acc.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAddingAccount && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-2">
                  {[UserRole.CUSTOMER, UserRole.VENDOR, UserRole.RIDER].map(role => (
                    <button 
                      key={role}
                      onClick={() => { login(`${role.toLowerCase()}@aura.com`, role); setIsAddingAccount(false); }}
                      className="py-2 text-[9px] font-black uppercase tracking-widest border border-slate-200 rounded-xl hover:bg-slate-950 hover:text-white transition-all"
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <button onClick={() => setIsAddingAccount(false)} className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cancel</button>
              </div>
            )}
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white group cursor-pointer overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="text-xl font-black tracking-tight mb-2">Aura for Teams</h4>
              <p className="text-xs font-medium text-indigo-100 leading-relaxed mb-6">Upgrade your enterprise infrastructure for global scale.</p>
              <button className="flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                Explore Enterprise <ArrowRightLeft size={14} />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
