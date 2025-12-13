import React from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

/**
 * Main App Component
 * Handles routing between Auth and Dashboard based on authentication state
 */
const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Route based on authentication
  return isAuthenticated ? <DashboardPage /> : <AuthPage />;
};

export default App;
