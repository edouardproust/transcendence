import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '@/stores/themeStore';
import { Button } from '../ui/Button';


export const Navbar: React.FC = () => {

  const { theme, toggleTheme } = useThemeStore();


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
            <>
              <Link to="/login">
                <Button variant="secondary">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Registrarse</Button>
              </Link>
            </>
        </div>
      </div>
    </nav>
  );
};
