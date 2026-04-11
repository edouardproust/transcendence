import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Friend, FriendRequest } from '@/types/friends';
import { Game } from '@/types/game';
import { UserProfile } from '@/types/user';
import { AUTH_CONSTRAINTS } from '@/features/auth/authConstraints';
import {
  getMatchResult,
  getMatchResultTone,
  getOpponentLabel,
  getPlayerColorLabel,
} from './profileUtils';

const sectionCardClassName =
  'rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800';

interface ProfileSummarySectionProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  isEditing: boolean;
  isUploadingAvatar: boolean;
  editData: { username: string; email: string };
  editErrors: { username?: string; email?: string };
  onEditDataChange: (field: 'username' | 'email', value: string) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: () => void;
  onAvatarUpload: (file: File) => void;
}

export const ProfileSummarySection: React.FC<ProfileSummarySectionProps> = ({
  profile,
  isOwnProfile,
  isEditing,
  isUploadingAvatar,
  editData,
  editErrors,
  onEditDataChange,
  onStartEditing,
  onCancelEditing,
  onSave,
  onAvatarUpload,
}) => {
  return (
    <div className={`${sectionCardClassName} mb-6`}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar src={profile.avatar_url} alt="Avatar" size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {profile.username}
            </h1>
            {profile.email ? (
              <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
            ) : null}
            <div className="mt-1">
              <Badge tone={profile.is_online ? 'success' : 'neutral'}>
                {profile.is_online ? 'En linea' : 'Desconectado'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Miembro desde {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{profile.elo}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">ELO Rating</div>
        </div>
      </div>

      {isOwnProfile && !isEditing ? (
        <div className="flex gap-2">
          <label className="cursor-pointer rounded-lg bg-gray-600 px-4 py-2 font-medium text-white transition hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">
            {isUploadingAvatar ? 'Subiendo...' : 'Subir Avatar'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onAvatarUpload(file);
              }}
            />
          </label>
          <Button onClick={onStartEditing}>Editar Perfil</Button>
        </div>
      ) : null}

      {isEditing ? (
        <div className="mt-4 space-y-3">
          <Input
            label="Nombre de usuario"
            value={editData.username}
            onChange={(e) => onEditDataChange('username', e.target.value)}
            minLength={AUTH_CONSTRAINTS.username.minLength}
            maxLength={AUTH_CONSTRAINTS.username.maxLength}
            error={editErrors.username}
          />
          <Input
            label="Email"
            type="email"
            value={editData.email}
            onChange={(e) => onEditDataChange('email', e.target.value)}
            error={editErrors.email}
          />
          <div className="flex gap-2">
            <Button onClick={onSave}>Guardar</Button>
            <Button variant="secondary" onClick={onCancelEditing}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const ProfileStatsSection: React.FC<{ profile: UserProfile; winRate: string }> = ({
  profile,
  winRate,
}) => {
  const statsRows = [
    { label: 'Partidas totales:', value: profile.totalGames, className: 'font-bold' },
    { label: 'Victorias:', value: profile.wins, className: 'font-bold text-green-600' },
    { label: 'Derrotas:', value: profile.losses, className: 'font-bold text-red-600' },
    { label: 'Empates:', value: profile.draws, className: 'font-bold text-gray-600' },
  ];

  return (
    <div className={sectionCardClassName}>
      <h2 className="mb-4 text-xl font-bold">📊 Estadísticas</h2>
      <div className="space-y-3">
        {statsRows.map((row) => (
          <div key={row.label} className="flex justify-between">
            <span>{row.label}</span>
            <span className={row.className}>{row.value}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t pt-2">
          <span>Tasa de victoria:</span>
          <span className="font-bold text-blue-600">{winRate}%</span>
        </div>
      </div>
    </div>
  );
};

interface ProfileSearchSectionProps {
  searchQuery: string;
  searchResults: Friend[];
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  onSendRequest: (receiverId: string) => void;
}

export const ProfileSearchSection: React.FC<ProfileSearchSectionProps> = ({
  searchQuery,
  searchResults,
  onSearchQueryChange,
  onSearch,
  onSendRequest,
}) => {
  return (
    <div className={sectionCardClassName}>
      <h2 className="mb-4 text-xl font-bold">🔍 Buscar Usuarios</h2>
      <div className="mb-4 flex gap-2">
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

      {searchResults.length > 0 ? (
        <div className="space-y-2">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="flex items-center justify-between rounded border p-3 hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">{result.username}</div>
                <div className="text-sm text-gray-600">ELO: {result.elo}</div>
              </div>
              <Button onClick={() => onSendRequest(result.id)}>Agregar</Button>
            </div>
          ))}
        </div>
      ) : null}

      {searchQuery.length >= 2 && searchResults.length === 0 ? (
        <p className="text-sm text-gray-500">No se encontraron usuarios</p>
      ) : null}
    </div>
  );
};

interface ProfileMatchHistorySectionProps {
  matchHistory: Game[];
  isLoadingHistory: boolean;
  currentUserId?: string;
}

export const ProfileMatchHistorySection: React.FC<ProfileMatchHistorySectionProps> = ({
  matchHistory,
  isLoadingHistory,
  currentUserId,
}) => {
  return (
    <div className={`${sectionCardClassName} mb-6`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">📜 Historial de Partidas</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Ultimas {matchHistory.length} partidas finalizadas
        </span>
      </div>

      {isLoadingHistory ? (
        <p className="text-gray-500 dark:text-gray-400">Cargando historial...</p>
      ) : matchHistory.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          Aun no hay partidas finalizadas para mostrar.
        </p>
      ) : (
        <div className="space-y-3">
          {matchHistory.map((game) => {
            const matchResult = getMatchResult(game, currentUserId);

            return (
              <div
                key={game.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      vs {getOpponentLabel(game, currentUserId)}
                    </span>
                    <Badge tone={getMatchResultTone(matchResult)}>{matchResult}</Badge>
                    <Badge tone={game.mode === 'ai' ? 'warning' : 'info'}>
                      {game.mode === 'ai' ? 'IA' : 'Online'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getPlayerColorLabel(game, currentUserId)} • {game.timeControl} •{' '}
                    {new Date(game.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{game.id.slice(0, 8)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ProfileRequestsSectionProps {
  requests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const ProfileRequestsSection: React.FC<ProfileRequestsSectionProps> = ({
  requests,
  onAccept,
  onReject,
}) => {
  if (requests.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold">📬 Solicitudes de Amistad ({requests.length})</h2>
      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <div className="font-medium">{request.username}</div>
              <div className="text-sm text-gray-600">ELO: {request.elo}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onAccept(request.id)}>✓ Aceptar</Button>
              <Button variant="danger" onClick={() => onReject(request.id)}>
                ✗ Rechazar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ProfileFriendsSectionProps {
  friends: Friend[];
  invitingFriendId: string | null;
  onViewProfile: (friendId: string) => void;
  onInviteToGame: (friendId: string) => void;
  onRemoveFriend: (friendId: string) => void;
}

export const ProfileFriendsSection: React.FC<ProfileFriendsSectionProps> = ({
  friends,
  invitingFriendId,
  onViewProfile,
  onInviteToGame,
  onRemoveFriend,
}) => {
  return (
    <div className={sectionCardClassName}>
      <h2 className="mb-4 text-xl font-bold">👥 Amigos ({friends.length})</h2>
      {friends.length === 0 ? (
        <p className="text-gray-500">No tienes amigos agregados aún.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex flex-col gap-3 rounded border p-4 hover:bg-gray-50 xl:flex-row xl:items-center xl:justify-between"
            >
              <div className="flex flex-1 items-center gap-3">
                <Avatar src={friend.avatar_url} alt={friend.username} size="sm" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium">{friend.username}</div>
                    <Badge tone={friend.is_online ? 'success' : 'neutral'}>
                      {friend.is_online ? 'En linea' : 'Desconectado'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    ELO: {friend.elo}
                    {friend.is_online ? ' • Listo para una partida rapida' : ' • Disponible al conectarse'}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 xl:justify-end">
                <Button
                  onClick={() => onInviteToGame(friend.id)}
                  disabled={!friend.is_online || Boolean(invitingFriendId)}
                >
                  {invitingFriendId === friend.id ? 'Enviando...' : 'Invitar a jugar'}
                </Button>
                <Button variant="secondary" onClick={() => onViewProfile(friend.id)}>
                  Ver Perfil
                </Button>
                <Button variant="danger" onClick={() => onRemoveFriend(friend.id)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
