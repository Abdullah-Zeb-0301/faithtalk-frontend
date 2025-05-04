import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import authService from './api/authService';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const verifyAuth = async () => {
      const user = authService.getUser();
      if (!user || !user.email) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        await authService.getCurrentUser(user.email);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth verification failed:', err);
        authService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
