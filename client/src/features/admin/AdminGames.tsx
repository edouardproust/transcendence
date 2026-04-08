import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { AdminGame } from '@/types/admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { pushToast } from '@/components/ui/ToastProvider';
import { AdminGameSortField, SortOrder } from '@/types/admin';
import { getApiErrorMessage } from '@/utils/apiError';

export const AdminGames: React.FC = () => {
  const [games, setGames] = useState<AdminGame[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<AdminGameSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadGames();
  }, [pagination.page, statusFilter, sortBy, sortOrder]);

  const loadGames = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getGames(pagination.page, statusFilter, sortBy, sortOrder);
      setGames(data.games);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error loading games:', error);
      const backendMessage = error.response?.data?.message;
      setGames([]);
      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || 'No se pudieron cargar las partidas.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm('¿Eliminar esta partida?')) return;

    try {
      await adminService.deleteGame(gameId);
      pushToast('Partida eliminada', 'success');
      void loadGames();
    } catch (error: any) {
      pushToast(getApiErrorMessage(error, 'Error eliminando partida'), 'error');
    }
  };

  const getStatusBadge = (status: string, mode: string) => {
    const labels = {
      active: 'Jugando',
      finished: 'Finalizada',
      cancelled: 'Cancelada',
    };

    const tones = {
      waiting: 'warning',
      active: 'success',
      finished: 'info',
      cancelled: 'danger',
    };

    const label =
      status === 'waiting' && mode === 'ai'
        ? 'Pendiente inicio'
        : status === 'waiting'
          ? 'Abierta'
          : labels[status as keyof typeof labels];

    return (
      <Badge tone={tones[status as keyof typeof tones] as 'warning' | 'success' | 'info' | 'danger'}>
        {label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2 text-xl">
          <Spinner />
          Cargando partidas...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="text-xl font-semibold text-red-700">Error cargando partidas</div>
          <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          <Button className="mt-4" variant="danger" onClick={() => void loadGames()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        ♟️ Gestión de Partidas
      </h1>

      {/* Filtros */}
      <Card className="mb-6">
        <CardBody>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Filtrar por estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((current) => ({ ...current, page: 1 }));
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Todos los estados</option>
                <option value="waiting">Abiertas / pendientes</option>
                <option value="active">Jugando</option>
                <option value="finished">Finalizadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setPagination((current) => ({ ...current, page: 1 }));
                  setSortBy(e.target.value as AdminGameSortField);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="createdAt">Fecha de creacion</option>
                <option value="updatedAt">Ultima actualizacion</option>
                <option value="status">Estado</option>
                <option value="mode">Modo</option>
                <option value="timeControl">Tiempo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Orden
              </label>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setPagination((current) => ({ ...current, page: 1 }));
                  setSortOrder(e.target.value as SortOrder);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Puedes combinar filtros por estado con ordenacion por fecha, estado, modo o control de tiempo.
          </p>
        </CardBody>
      </Card>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">ID</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Jugadores</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Modo</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Tiempo</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Estado</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Ganador</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Creada</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {games.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 px-4 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron partidas para este filtro.
                  </td>
                </tr>
              )}
              {games.map((game) => (
                <tr
                  key={game.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                    {game.id.slice(0, 8)}...
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-gray-100">♔ {game.white_username}</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        ♚ {game.black_username || (game.mode === 'ai' ? 'ChessAI' : 'Esperando rival...')}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {game.mode === 'online' ? '👥 Online' : '🤖 IA'}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {game.time_control}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(game.status, game.mode)}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {game.winner_username || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(game.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="danger" onClick={() => void handleDelete(game.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {games.length} de {pagination.total} partidas
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((current) => ({ ...current, page: current.page - 1 }))
              }
            >
              Anterior
            </Button>
            <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setPagination((current) => ({ ...current, page: current.page + 1 }))
              }
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
