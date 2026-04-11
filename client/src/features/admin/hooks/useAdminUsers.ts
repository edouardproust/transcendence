import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { AdminUser, AdminUserSortField, SortOrder } from '@/types/admin';
import { pushToast } from '@/components/ui/ToastProvider';
import { getApiErrorMessage } from '@/utils/apiError';

interface PaginationState {
  total: number;
  page: number;
  totalPages: number;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sortBy, setSortBy] = useState<AdminUserSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getUsers(
        pagination.page,
        appliedSearch,
        sortBy,
        sortOrder,
      );
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error loading users:', error);
      const backendMessage = error.response?.data?.message;
      setUsers([]);
      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || 'No se pudieron cargar los usuarios.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, appliedSearch, sortBy, sortOrder]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleSearch = () => {
    const normalizedSearch = search.trim();

    if (normalizedSearch.length === 1) {
      pushToast('Ingresa al menos 2 caracteres para buscar.', 'error');
      return;
    }

    setPagination((current) => ({ ...current, page: 1 }));
    setAppliedSearch(normalizedSearch);
  };

  const updateUser = async (
    userId: string,
    data: { elo?: number; role?: 'USER' | 'ADMIN' },
  ) => {
    try {
      await adminService.updateUser(userId, data);
      pushToast('Usuario actualizado', 'success');
      void loadUsers();
    } catch (error: any) {
      pushToast(getApiErrorMessage(error, 'Error actualizando usuario'), 'error');
    }
  };

  const deleteUser = async (userId: string, username: string) => {
    if (!confirm(`¿Eliminar usuario ${username}? Esta acción es irreversible.`)) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      pushToast('Usuario eliminado', 'success');
      void loadUsers();
    } catch (error: any) {
      pushToast(getApiErrorMessage(error, 'Error eliminando usuario'), 'error');
    }
  };

  const setPage = (page: number) => {
    setPagination((current) => ({ ...current, page }));
  };

  return {
    users,
    pagination,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    isLoading,
    errorMessage,
    loadUsers,
    handleSearch,
    updateUser,
    deleteUser,
    setPage,
  };
};
