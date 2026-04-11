import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';

const adminNavItems = [
  { to: '/admin', label: '📊 Dashboard' },
  { to: '/admin/users', label: '👥 Usuarios' },
  { to: '/admin/games', label: '♟️ Partidas' },
];

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) => `
    px-4 py-2 rounded-lg font-medium transition
    ${isActive(path)
      ? 'bg-blue-600 dark:bg-blue-700 text-white'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }
  `;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header de Admin */}
      <div className="bg-purple-600 dark:bg-purple-800 text-white p-4 shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <h1 className="text-xl font-bold">Panel de Administración</h1>
              <p className="text-sm opacity-90">Bienvenido, {user?.username}</p>
            </div>
          </div>
          <Link to="/lobby" className="text-white hover:text-gray-200">
            ← Volver al sitio
          </Link>
        </div>
      </div>

      {/* Navegación */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex gap-4">
            {adminNavItems.map((item) => (
              <Link key={item.to} to={item.to} className={navLinkClass(item.to)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenido */}
      <div className="py-6">
        <Outlet />
      </div>
    </div>
  );
};
