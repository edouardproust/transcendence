import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { AdminStats } from '@/types/admin';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      const backendMessage = error.response?.data?.message;
      setStats(null);
      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || 'No se pudieron cargar las estadísticas.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="text-xl font-semibold text-red-700">Error cargando estadísticas</div>
          <p className="mt-2 text-sm text-red-600">
            {errorMessage || 'No se pudieron obtener los datos del panel.'}
          </p>
          <button
            type="button"
            onClick={() => void loadStats()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        👑 Panel de Administración
      </h1>

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Se cargó el panel, pero el servidor respondió con avisos: {errorMessage}
        </div>
      )}

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.stats.total_users}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            +{stats.stats.new_users_week} esta semana
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Partidas</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.stats.total_games}
              </p>
            </div>
            <div className="text-4xl">♟️</div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            {stats.stats.active_games} activas ahora
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Partidas 24h</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.stats.games_last_24h}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {stats.stats.finished_games} finalizadas en total
          </p>
        </div>
      </div>

      {/* Top Jugadores */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          🏆 Top 10 Jugadores por ELO
        </h2>
        <div className="overflow-x-auto">
          {stats.topPlayers.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
              No hay jugadores para mostrar todavia.
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">#</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Usuario</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Email</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">ELO</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {stats.topPlayers.map((player, index) => (
                  <tr
                    key={player.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && index + 1}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                      {player.username}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {player.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {player.elo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(player.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          📜 Actividad Reciente
        </h2>
        {stats.recentActivity.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay actividad reciente para mostrar.
          </p>
        ) : (
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {activity.white_username}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">vs</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {activity.black_username || 'Esperando...'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.mode === 'online' ? '👥 Online' : '🤖 IA'} •
                    {activity.status === 'active' && ' 🟢 Jugando'}
                    {activity.status === 'waiting' &&
                      (activity.mode === 'ai' ? ' 🟡 Pendiente inicio' : ' 🟡 Abierta')}
                    {activity.status === 'finished' &&
                      ` ✓ Ganó: ${activity.winner_username || 'Tablas'}`}
                    {activity.status === 'cancelled' && ' ❌ Cancelada'}
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(activity.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
