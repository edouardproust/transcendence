import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { Button } from '../ui/Button';
import { authService } from '@/services/authService';
// import { disconnectSocket } from '@/engine/socket';
// import { disconnectPresenceSocket } from '@/engine/presenceSocket';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // disconnectSocket();
      // disconnectPresenceSocket();
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <nav className="bg-gray-800 dark:bg-gray-950 text-white p-4 border-b border-gray-700 dark:border-gray-800">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-gray-300 transition">
          ♔ Ajedrez Web
        </Link>
        
        <div className="flex items-center gap-4">
          <Link
            to="/privacy-policy"
            className="text-sm text-gray-200 hover:text-white transition underline underline-offset-4"
          >
            Privacy
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 dark:hover:bg-gray-700 transition"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <>
              <span className="text-sm">
                {user.username}
              </span>
              {user.role === 'admin' && (
                <Link to="/admin">
                  <Button variant="primary">👑 Admin</Button>
                </Link>
              )}
              <Link to="/profile">
                <Button variant="secondary">Mi Perfil</Button>
              </Link>
              <Link to="/lobby">
                <Button variant="secondary">Lobby</Button>
              </Link>
              <Button variant="danger" onClick={() => void handleLogout()}>
                Salir
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
