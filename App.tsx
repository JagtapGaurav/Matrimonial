
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SettingsPage from './pages/SettingsPage';
import ShortlistedPage from './pages/ShortlistedPage';

const PrivateRoute: React.FC<{ children: React.ReactElement; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (!adminOnly && isAdmin) {
      return <Navigate to="/admin" replace />;
  }

  return children;
};

const AppRoutes: React.FC = () => {
    const { user, isAdmin } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
                path="/dashboard" 
                element={
                    <PrivateRoute>
                        <UserDashboardPage />
                    </PrivateRoute>
                } 
            />
             <Route 
                path="/settings" 
                element={
                    <PrivateRoute>
                        <SettingsPage />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/shortlisted" 
                element={
                    <PrivateRoute>
                        <ShortlistedPage />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/admin" 
                element={
                    <PrivateRoute adminOnly={true}>
                        <AdminDashboardPage />
                    </PrivateRoute>
                }
            />
            <Route path="/" element={<Navigate to={user ? (isAdmin ? "/admin" : "/dashboard") : "/login"} />} />
        </Routes>
    )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen bg-gray-50 text-gray-800">
          <AppRoutes />
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;