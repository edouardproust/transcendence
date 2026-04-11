import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { AdminStats } from '@/types/admin';
import { PageErrorState, PageLoader } from '@/components/ui/PageState';
import { getPodiumLabel, getRecentActivityStatusText } from './adminUtils';

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: string;
  helperText: string;
  helperClassName: string;
}> = ({ label, value, icon, helperText, helperClassName }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
      <p className={`mt-2 text-xs ${helperClassName}`}>{helperText}</p>
    </div>
  );
};

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
    return <PageLoader message="Cargando dashboard..." />;
  }

  if (!stats) {
    return (
      <PageErrorState
        title="Error cargando estadísticas"
        message={errorMessage || 'No se pudieron obtener los datos del panel.'}
        onRetry={() => void loadStats()}
      />
    );
  }

  const statCards = [
    {
      label: 'Total Usuarios',
      value: stats.stats.total_users,
      icon: '👥',
      helperText: `+${stats.stats.new_users_week} esta semana`,
      helperClassName: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Total Partidas',
      value: stats.stats.total_games,
      icon: '♟️',
      helperText: `${stats.stats.active_games} activas ahora`,
      helperClassName: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Partidas 24h',
      value: stats.stats.games_last_24h,
      icon: '📊',
      helperText: `${stats.stats.finished_games} finalizadas en total`,
      helperClassName: 'text-gray-600 dark:text-gray-400',
    },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

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
                    <td className="py-3 px-4">{getPodiumLabel(index)}</td>
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
                    {getRecentActivityStatusText(activity)}
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
