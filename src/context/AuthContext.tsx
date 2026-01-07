
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../mockData';

interface AuthContextType {
  user: User | null;
  accounts: User[];
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  switchAccount: (userId: string) => void;
  removeAccount: (userId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('aura_user');
    const savedAccounts = localStorage.getItem('aura_accounts');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
    
    setIsLoading(false);
  }, []);

  const login = (email: string, role: UserRole) => {
    const baseUser = MOCK_USERS.find(u => u.role === role);
    if (baseUser) {
      const newUser: User = { 
        ...baseUser, 
        email, 
        joinedAt: new Date().toISOString(),
        phone: '+1 (555) 000-0000',
        location: 'New York, USA',
        bio: `Professional ${role.toLowerCase()} on the Aura network.`
      };
      
      setUser(newUser);
      
      setAccounts(prev => {
        const exists = prev.find(a => a.id === newUser.id && a.role === newUser.role);
        const updated = exists ? prev.map(a => a.id === newUser.id ? newUser : a) : [...prev, newUser];
        localStorage.setItem('aura_accounts', JSON.stringify(updated));
        return updated;
      });
      
      localStorage.setItem('aura_user', JSON.stringify(newUser));
    }
  };

  const switchAccount = (userId: string) => {
    const target = accounts.find(a => a.id === userId);
    if (target) {
      setUser(target);
      localStorage.setItem('aura_user', JSON.stringify(target));
    }
  };

  const removeAccount = (userId: string) => {
    const updated = accounts.filter(a => a.id !== userId);
    setAccounts(updated);
    localStorage.setItem('aura_accounts', JSON.stringify(updated));
    if (user?.id === userId) {
      if (updated.length > 0) {
        setUser(updated[0]);
        localStorage.setItem('aura_user', JSON.stringify(updated[0]));
      } else {
        logout();
      }
    }
  };

  const logout = () => {
    setUser(null);
    setAccounts([]);
    localStorage.removeItem('aura_user');
    localStorage.removeItem('aura_accounts');
  };

  return (
    <AuthContext.Provider value={{ user, accounts, login, logout, switchAccount, removeAccount, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
