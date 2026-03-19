import React, { useEffect, useState } from 'react';

export const AdminDashboard: React.FC = () => {

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        👑 Panel de Administración
      </h1>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>

        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Partidas</p>

            </div>
            <div className="text-4xl">♟️</div>
          </div>

        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Partidas 24h</p>

            </div>
            <div className="text-4xl">📊</div>
          </div>

        </div>
      </div>

      {/* Top Jugadores */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          🏆 Top 10 Jugadores por ELO
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">#</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Usuario</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Email</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">ELO</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Registrado</th>
              </tr>
            </thead>
          
          </table>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          📜 Actividad Reciente
        </h2>
     
      </div>
    </div>
  );
};
