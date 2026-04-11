import React from 'react';
import { Button } from '@/components/ui/Button';
import { AdminUser } from '@/types/admin';

interface UserEditModalProps {
  user: AdminUser | null;
  currentUserId?: string;
  onSave: (elo: string, role: 'USER' | 'ADMIN') => void;
  onClose: () => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  currentUserId,
  onSave,
  onClose,
}) => {
  if (!user) return null;

  const [editElo, setEditElo] = React.useState(String(user.elo));
  const [editRole, setEditRole] = React.useState<'USER' | 'ADMIN'>(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Editar Usuario: {user.username}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              ELO Rating
            </label>
            <input
              type="number"
              value={editElo}
              onChange={(e) => setEditElo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Rol
            </label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as 'USER' | 'ADMIN')}
              disabled={user.id === currentUserId}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            >
              <option value="USER">Usuario</option>
              <option value="ADMIN">Administrador</option>
            </select>
            {user.id === currentUserId && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Tu propio rol no se puede degradar desde esta pantalla.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => onSave(editElo, editRole)}>Guardar Cambios</Button>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};
