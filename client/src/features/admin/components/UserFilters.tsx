import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AdminUserSortField, SortOrder } from '@/types/admin';

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  sortBy: AdminUserSortField;
  onSortByChange: (value: AdminUserSortField) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  search,
  onSearchChange,
  onSearch,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_140px_auto]">
        <Input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') onSearch();
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as AdminUserSortField)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="createdAt">Mas recientes</option>
          <option value="username">Usuario</option>
          <option value="email">Email</option>
          <option value="elo">ELO</option>
          <option value="role">Rol</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="desc">Descendente</option>
          <option value="asc">Ascendente</option>
        </select>
        <Button onClick={onSearch}>Buscar</Button>
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Busqueda con paginacion, filtros y ordenacion por usuario, email, ELO, rol o fecha.
      </p>
    </div>
  );
};
