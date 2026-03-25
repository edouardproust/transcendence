import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';

export const AdminGames: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        ♟️ Gestión de Partidas
      </h1>

      {/* Filtros */}
      <Card className="mb-6">
        <CardBody>
          <div className="max-w-xl text-sm text-gray-600 dark:text-gray-400">
            La gestión avanzada de partidas todavía está en construcción en esta rama.
          </div>
        </CardBody>
      </Card>

    </div>
  );
};
