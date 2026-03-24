import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const AdminUsers: React.FC = () => {
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    loadUsers();
  }, [pagination.page, search]);

  const loadUsers = async () => {
    setIsLoading(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        👥 Gestión de Usuarios
      </h1>

      {/* Búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex gap-3">
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button 
          >Buscar</Button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Usuario</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Email</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">ELO</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Rol</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Partidas</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Registrado</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {user.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {user.total_games}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {users.length} de {pagination.total} usuarios
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              Anterior
            </Button>
            <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
