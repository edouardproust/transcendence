import { AdminStats } from '@/types/admin';

interface ActivityFeedProps {
  activities: AdminStats['recentActivity'];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        📜 Actividad Reciente
      </h2>
      {activities.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No hay actividad reciente para mostrar.
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
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
                    ` ✓ Gano: ${activity.winner_username || 'Tablas'}`}
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
  );
};
