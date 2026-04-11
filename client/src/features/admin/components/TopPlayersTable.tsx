import { AdminStats } from '@/types/admin';

interface TopPlayersTableProps {
  topPlayers: AdminStats['topPlayers'];
}

export const TopPlayersTable: React.FC<TopPlayersTableProps> = ({ topPlayers }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        🏆 Top 10 Jugadores por ELO
      </h2>
      <div className="overflow-x-auto">
        {topPlayers.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
            No hay jugadores para mostrar todavia.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                  #
                </th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                  Usuario
                </th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                  ELO
                </th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                  Registrado
                </th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map((player, index) => (
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
  );
};
