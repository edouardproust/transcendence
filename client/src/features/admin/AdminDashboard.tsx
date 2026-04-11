import React from 'react';
import { Button } from '@/components/ui/Button';
import { useAdminStats } from './hooks/useAdminStats';
import { StatCard, TopPlayersTable, ActivityFeed } from './components';

export const AdminDashboard: React.FC = () => {
  const { stats, isLoading, errorMessage, retry } = useAdminStats();

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
          <div className="text-xl font-semibold text-red-700">
            Error cargando estadísticas
          </div>
          <p className="mt-2 text-sm text-red-600">
            {errorMessage || 'No se pudieron obtener los datos del panel.'}
          </p>
          <Button className="mt-4" variant="danger" onClick={retry}>
            Reintentar
          </Button>
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
          Se cargo el panel, pero el servidor respondio con avisos: {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Usuarios"
          value={stats.stats.total_users}
          icon="👥"
          subtitle={`+${stats.stats.new_users_week} esta semana`}
          subtitleColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          title="Total Partidas"
          value={stats.stats.total_games}
          icon="♟️"
          subtitle={`${stats.stats.active_games} activas ahora`}
          subtitleColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Partidas 24h"
          value={stats.stats.games_last_24h}
          icon="📊"
          subtitle={`${stats.stats.finished_games} finalizadas en total`}
        />
      </div>

      <TopPlayersTable topPlayers={stats.topPlayers} />
      <ActivityFeed activities={stats.recentActivity} />
    </div>
  );
};
