import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Friend } from '@/types/friends';

interface UserSearchProps {
  searchQuery: string;
  searchResults: Friend[];
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onSendRequest: (userId: string) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({
  searchQuery,
  searchResults,
  onSearchQueryChange,
  onSearch,
  onSendRequest,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">🔍 Buscar Usuarios</h2>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Buscar por nombre..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') onSearch();
          }}
        />
        <Button onClick={onSearch}>Buscar</Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">{result.username}</div>
                <div className="text-sm text-gray-600">ELO: {result.elo}</div>
              </div>
              <Button onClick={() => void onSendRequest(result.id)}>Agregar</Button>
            </div>
          ))}
        </div>
      )}

      {searchQuery.length >= 2 && searchResults.length === 0 && (
        <p className="text-gray-500 text-sm">No se encontraron usuarios</p>
      )}
    </div>
  );
};
