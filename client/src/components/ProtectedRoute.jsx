import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  // Check if user exists in state or if token exists in localStorage
  const isAuthenticated = user || localStorage.getItem('token');

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
