import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { Button } from '@/components/ui/Button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="dark:bg-gray-800 max-w-4xl mx-auto text-center mt-20">
      <h1 className="text-6xl font-bold mb-6">♔ Chess 42</h1>
      <p className="text-xl text-gray-600 mb-8">
        Juega ajedrez online con otros jugadores o practica contra la computadora
      </p>

      <div className="flex justify-center gap-4 mb-12">
        {user ? (
          <Button onClick={() => navigate('/lobby')} className="text-lg px-8 py-3">
            Ir al Lobby
          </Button>
        ) : (
          <>
            <Button onClick={() => navigate('/register')} className="text-lg px-8 py-3">
              Comenzar
            </Button>
            <Button 
              onClick={() => navigate('/login')} 
              variant="secondary"
              className="text-lg px-8 py-3"
            >
              Iniciar Sesión
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-4xl mb-3">⚔️</div>
          <h3 className="text-xl font-bold mb-2">Multijugador</h3>
          <p className="text-gray-600">
            Juega contra otros jugadores en tiempo real
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-4xl mb-3">🤖</div>
          <h3 className="text-xl font-bold mb-2">Vs IA</h3>
          <p className="text-gray-600">
            Practica contra Stockfish, uno de los mejores motores de ajedrez
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-xl font-bold mb-2">Sistema ELO</h3>
          <p className="text-gray-600">
            Sube tu ranking jugando partidas competitivas
          </p>
        </div>
      </div>

      <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
        Al usar esta plataforma aceptas nuestra{' '}
        <Link to="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
          Política de Privacidad
        </Link>
        .
      </p>
    </div>
  );
};
