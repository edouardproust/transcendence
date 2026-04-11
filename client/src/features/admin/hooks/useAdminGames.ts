import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { AdminGame, AdminGameSortField, SortOrder } from '@/types/admin';
import { pushToast } from '@/components/ui/ToastProvider';
import { getApiErrorMessage } from '@/utils/apiError';

interface PaginationState {
  total: number;
  page: number;
  totalPages: number;
}

export const useAdminGames = () => {
  const [games, setGames] = useState<AdminGame[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<AdminGameSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getGames(
        pagination.page,
        statusFilter,
        sortBy,
        sortOrder,
      );
      setGames(data.games);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error loading games:', error);
      const backendMessage = error.response?.data?.message;
      setGames([]);
      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || 'No se pudieron cargar las partidas.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    void loadGames();
  }, [loadGames]);

  const deleteGame = async (gameId: string) => {
    if (!confirm('¿Eliminar esta partida?')) return;

    try {
      await adminService.deleteGame(gameId);
      pushToast('Partida eliminada', 'success');
      void loadGames();
    } catch (error: any) {
      pushToast(getApiErrorMessage(error, 'Error eliminando partida'), 'error');
    }
  };

  const setPage = (page: number) => {
    setPagination((current) => ({ ...current, page }));
  };

  const setStatusFilterAndReset = (status: string) => {
    setStatusFilter(status);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  return {
    games,
    pagination,
    statusFilter,
    setStatusFilter: setStatusFilterAndReset,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    isLoading,
    errorMessage,
    loadGames,
    deleteGame,
    setPage,
  };
};
