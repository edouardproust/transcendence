import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export const AdminGames: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        ♟️ Gestión de Partidas
      </h1>

      {/* Filtros */}
      <Card className="mb-6">
        <CardBody>
          <div className="max-w-xs">
          </div>
        </CardBody>
      </Card>

    </div>
  );
};
