import React, { useState } from 'react';
import { useAuthStore } from '@/features/auth/authStore';
import { useAdminUsers } from './hooks/useAdminUsers';
import { Button } from '@/components/ui/Button';
import { UserFilters, UsersTable, Pagination, UserEditModal } from './components';
import { AdminUser } from '@/types/admin';

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const {
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
  } = useAdminUsers();

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
  };

  const handleSaveEdit = async (elo: string, role: 'USER' | 'ADMIN') => {
    if (!editingUser) return;
    const parsedElo = Number.parseInt(elo, 10);

    await updateUser(editingUser.id, {
      elo: Number.isNaN(parsedElo) ? undefined : parsedElo,
      role: editingUser.id === currentUser?.id ? undefined : role,
    });
    setEditingUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando usuarios...</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="text-xl font-semibold text-red-700">
            Error cargando usuarios
          </div>
          <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          <Button className="mt-4" variant="danger" onClick={() => void loadUsers()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        👥 Gestión de Usuarios
      </h1>

      <UserFilters
        search={search}
        onSearchChange={setSearch}
        onSearch={handleSearch}
        sortBy={sortBy}
        onSortByChange={(value) => {
          setPage(1);
          setSortBy(value);
        }}
        sortOrder={sortOrder}
        onSortOrderChange={(value) => {
          setPage(1);
          setSortOrder(value);
        }}
      />

      <UsersTable
        users={users}
        currentUserId={currentUser?.id}
        onEdit={handleEdit}
        onDelete={deleteUser}
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsCount={users.length}
        onPageChange={setPage}
      />

      <UserEditModal
        user={editingUser}
        currentUserId={currentUser?.id}
        onSave={handleSaveEdit}
        onClose={() => setEditingUser(null)}
      />
    </div>
  );
};
