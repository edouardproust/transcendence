import { AdminGameSortField, SortOrder } from '@/types/admin';
import { Card, CardBody } from '@/components/ui/Card';

interface GameFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: AdminGameSortField;
  onSortByChange: (value: AdminGameSortField) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
}

export const GameFilters: React.FC<GameFiltersProps> = ({
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}) => {
  return (
    <Card className="mb-6">
      <CardBody>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Filtrar por estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
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
              onChange={(e) => onSortByChange(e.target.value as AdminGameSortField)}
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
              onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
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
  );
};
