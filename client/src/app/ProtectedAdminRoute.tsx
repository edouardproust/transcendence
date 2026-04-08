import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">❌ Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta página.</p>
          <Link to="/lobby" className="text-blue-600 hover:underline">
            Volver al lobby
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
