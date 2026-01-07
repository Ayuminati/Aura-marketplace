
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import LandingPage from './views/LandingPage';
import CustomerView from './views/CustomerView';
import VendorView from './views/VendorView';
import RiderView from './views/RiderView';
import AdminView from './views/AdminView';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading Aura...</div>;
  if (!user) return <Navigate to="/" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  
  return <>{children}</>;
};

const RoleRouter = () => {
  const { user } = useAuth();

  if (!user) return <LandingPage />;

  switch (user.role) {
    case UserRole.CUSTOMER: return <CustomerView />;
    case UserRole.VENDOR: return <VendorView />;
    case UserRole.RIDER: return <RiderView />;
    case UserRole.ADMIN: return <AdminView />;
    default: return <LandingPage />;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<RoleRouter />} />
            <Route path="/checkout" element={
              <ProtectedRoute roles={[UserRole.CUSTOMER]}>
                <CustomerView />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
