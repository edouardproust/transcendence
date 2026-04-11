import React from 'react';
import { useAdminGames } from './hooks/useAdminGames';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { GameFilters, GamesTable, Pagination } from './components';

export const AdminGames: React.FC = () => {
  const {
    games,
    pagination,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    isLoading,
    errorMessage,
    loadGames,
    deleteGame,
    setPage,
  } = useAdminGames();

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
          <div className="text-xl font-semibold text-red-700">
            Error cargando partidas
          </div>
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

      <GameFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
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

      <GamesTable games={games} onDelete={deleteGame} />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsCount={games.length}
        onPageChange={setPage}
      />
    </div>
  );
};
