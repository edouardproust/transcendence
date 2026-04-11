import { AdminUser } from '@/types/admin';
import { Button } from '@/components/ui/Button';

interface UsersTableProps {
  users: AdminUser[];
  currentUserId?: string;
  onEdit: (user: AdminUser) => void;
  onDelete: (userId: string, username: string) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                Usuario
              </th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                Email
              </th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">ELO</th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Rol</th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                Partidas
              </th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                Registrado
              </th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 px-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No se encontraron usuarios para esta busqueda.
                </td>
              </tr>
            )}
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;

              return (
                <tr
                  key={user.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    {user.username}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {user.elo}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {user.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                    </span>
                    {isCurrentUser && (
                      <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        Tu cuenta
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {user.total_games}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => onEdit(user)}>
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        disabled={isCurrentUser}
                        onClick={() => void onDelete(user.id, user.username)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
