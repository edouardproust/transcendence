import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { friendsService } from "@/services/friendsService";
import { gameService } from "@/services/gameService";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/features/auth/authStore";
import { UserProfile } from "@/types/user";
import { Friend, FriendRequest } from "@/types/friends";
import { Game } from "@/types/game";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { pushToast } from "@/components/ui/ToastProvider";
import { connectPresenceSocket } from "@/engine/presenceSocket";
import {
  AUTH_CONSTRAINTS,
  validateEmail,
  validateUsername,
} from "@/features/auth/authConstraints";
import { getApiErrorMessage } from "@/utils/apiError";

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: "", email: "" });
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [matchHistory, setMatchHistory] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editErrors, setEditErrors] = useState<{
    username?: string;
    email?: string;
  }>({});

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    void loadProfile();
    if (isOwnProfile) {
      void loadFriends();
      void loadRequests();
      void loadMatchHistory();
      return;
    }

    setFriends([]);
    setRequests([]);
    setSearchResults([]);
    setMatchHistory([]);
  }, [userId, isOwnProfile]);

  const applyUserStatus = (
    targetUserId: string,
    isOnline: boolean,
    lastSeen: string,
  ) => {
    setProfile((prev) =>
      prev && prev.id === targetUserId
        ? { ...prev, is_online: isOnline, last_seen: lastSeen }
        : prev,
    );
    setFriends((prev) =>
      prev.map((friend) =>
        friend.id === targetUserId
          ? { ...friend, is_online: isOnline, last_seen: lastSeen }
          : friend,
      ),
    );
    setRequests((prev) =>
      prev.map((request) =>
        request.sender_id === targetUserId
          ? { ...request, is_online: isOnline, last_seen: lastSeen }
          : request,
      ),
    );
    setSearchResults((prev) =>
      prev.map((result) =>
        result.id === targetUserId
          ? { ...result, is_online: isOnline, last_seen: lastSeen }
          : result,
      ),
    );
  };

  useEffect(() => {
    if (!token) return;

    const socket = connectPresenceSocket(token);
    const handleUserStatus = (data: {
      userId: string;
      is_online: boolean;
      last_seen: string;
    }) => {
      applyUserStatus(data.userId, data.is_online, data.last_seen);
    };

    socket.on("user_status", handleUserStatus);

    return () => {
      socket.off("user_status", handleUserStatus);
    };
  }, [token]);

  const loadProfile = async () => {
    try {
      const data = await userService.getProfile(userId);
      setProfile(data);
      setEditData({ username: data.username, email: data.email ?? "" });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      const data = await friendsService.getFriends();
      setFriends(data);
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await friendsService.getPendingRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  const loadMatchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const games = await gameService.getUserGames();
      setMatchHistory(
        games.filter((game) => game.status === "finished").slice(0, 10),
      );
    } catch (error) {
      console.error("Error loading match history:", error);
      pushToast("Error cargando historial de partidas", "error");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpdateProfile = async () => {
    const nextEditErrors = {
      username: validateUsername(editData.username) ?? undefined,
      email: validateEmail(editData.email) ?? undefined,
    };

    if (nextEditErrors.username || nextEditErrors.email) {
      setEditErrors(nextEditErrors);
      return;
    }

    try {
      const updated = await userService.updateProfile({
        username: editData.username.trim(),
        email: editData.email.trim(),
      });
      setProfile(updated);
      setEditErrors({});
      setIsEditing(false);
      pushToast("Perfil actualizado exitosamente", "success");
    } catch (error: any) {
      pushToast(
        getApiErrorMessage(error, "Error actualizando perfil"),
        "error",
      );
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploadingAvatar(true);
      const result = await userService.uploadAvatar(file);
      setProfile((prev) =>
        prev ? { ...prev, avatar_url: result.avatar_url } : prev,
      );
      pushToast("Avatar actualizado", "success");
    } catch (error: any) {
      pushToast(getApiErrorMessage(error, "Error subiendo avatar"), "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSearch = async () => {
    const normalizedQuery = searchQuery.trim();

    if (normalizedQuery.length < 2) {
      pushToast("Ingresa al menos 2 caracteres", "error");
      return;
    }

    try {
      const friendIds = new Set(friends.map((friend) => friend.id));
      const pendingSenderIds = new Set(
        requests.map((request) => request.sender_id),
      );
      const results = await userService.searchUsers(normalizedQuery);
      setSearchResults(
        results.filter(
          (result) =>
            result.id !== user?.id &&
            !friendIds.has(result.id) &&
            !pendingSenderIds.has(result.id),
        ),
      );
    } catch (error) {
      console.error("Error searching users:", error);
      pushToast("Error buscando usuarios", "error");
    }
  };

  const handleSendRequest = async (receiverId: string) => {
    if (receiverId === user?.id) {
      pushToast("No puedes enviarte una solicitud a ti mismo", "error");
      return;
    }

    try {
      await friendsService.sendFriendRequest(receiverId);
      pushToast("Solicitud enviada", "success");
      setSearchResults([]);
      setSearchQuery("");
    } catch (error: any) {
      pushToast(getApiErrorMessage(error, "Error enviando solicitud"), "error");
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendsService.acceptRequest(requestId);
      await loadRequests();
      await loadFriends();
      pushToast("Solicitud aceptada", "success");
    } catch (error) {
      pushToast("Error aceptando solicitud", "error");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendsService.rejectRequest(requestId);
      await loadRequests();
      pushToast("Solicitud rechazada", "success");
    } catch (error) {
      pushToast("Error rechazando solicitud", "error");
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm("¿Eliminar este amigo?")) return;

    try {
      await friendsService.removeFriend(friendId);
      await loadFriends();
      pushToast("Amigo eliminado", "success");
    } catch (error) {
      pushToast("Error eliminando amigo", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Perfil no encontrado</div>
      </div>
    );
  }

  const winRate =
    profile.totalGames > 0
      ? ((profile.wins / profile.totalGames) * 100).toFixed(1)
      : "0";

  const getPgnResultToken = (pgn: string) => {
    const tokens = pgn.trim().split(/\s+/);
    const lastToken = tokens[tokens.length - 1];

    return lastToken === "1-0" || lastToken === "0-1" || lastToken === "1/2-1/2"
      ? lastToken
      : null;
  };

  const getMatchResult = (game: Game) => {
    if (game.status === "cancelled") return "Cancelada";
    if (game.status !== "finished") return "En curso";
    if (game.winnerId === user?.id) return "Victoria";

    const pgnResult = getPgnResultToken(game.pgn);
    if (pgnResult === "1/2-1/2") return "Empate";
    if (pgnResult === "1-0")
      return game.whitePlayerId === user?.id ? "Victoria" : "Derrota";
    if (pgnResult === "0-1")
      return game.blackPlayerId === user?.id ? "Victoria" : "Derrota";
    if (game.winnerId) return "Derrota";

    return "Empate";
  };

  const getMatchResultTone = (result: string) => {
    if (result === "Victoria") return "success";
    if (result === "Derrota") return "danger";
    if (result === "Empate") return "info";
    if (result === "Cancelada") return "warning";
    return "neutral";
  };

  const getOpponentLabel = (game: Game) => {
    if (game.mode === "ai") return "ChessAI";

    const opponentId =
      game.whitePlayerId === user?.id ? game.blackPlayerId : game.whitePlayerId;
    return opponentId ? `Jugador ${opponentId.slice(0, 8)}` : "Rival pendiente";
  };

  const getPlayerColorLabel = (game: Game) => {
    if (game.whitePlayerId === user?.id) return "Blancas";
    if (game.blackPlayerId === user?.id) return "Negras";
    return "-";
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Información del Perfil */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-4">
            <Avatar src={profile.avatar_url} alt="Avatar" size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {profile.username}
              </h1>
              {profile.email && (
                <p className="text-gray-600 dark:text-gray-400">
                  {profile.email}
                </p>
              )}
              <div className="mt-1">
                <Badge tone={profile.is_online ? "success" : "neutral"}>
                  {profile.is_online ? "En linea" : "Desconectado"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Miembro desde{" "}
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {profile.elo}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              ELO Rating
            </div>
          </div>
        </div>

        {isOwnProfile && !isEditing && (
          <div className="flex gap-2">
            <label className="px-4 py-2 rounded-lg font-medium transition bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white cursor-pointer">
              {isUploadingAvatar ? "Subiendo..." : "Subir Avatar"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleAvatarUpload(file);
                }}
              />
            </label>
            <Button onClick={() => setIsEditing(true)}>Editar Perfil</Button>
          </div>
        )}

        {isEditing && (
          <div className="mt-4 space-y-3">
            <Input
              label="Nombre de usuario"
              value={editData.username}
              onChange={(e) => {
                setEditData({ ...editData, username: e.target.value });
                setEditErrors((current) => ({
                  ...current,
                  username: undefined,
                }));
              }}
              minLength={AUTH_CONSTRAINTS.username.minLength}
              maxLength={AUTH_CONSTRAINTS.username.maxLength}
              error={editErrors.username}
            />
            <Input
              label="Email"
              type="email"
              value={editData.email}
              onChange={(e) => {
                setEditData({ ...editData, email: e.target.value });
                setEditErrors((current) => ({ ...current, email: undefined }));
              }}
              error={editErrors.email}
            />
            <div className="flex gap-2">
              <Button onClick={handleUpdateProfile}>Guardar</Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Estadísticas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">📊 Estadísticas</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Partidas totales:</span>
              <span className="font-bold">{profile.totalGames}</span>
            </div>
            <div className="flex justify-between">
              <span>Victorias:</span>
              <span className="font-bold text-green-600">{profile.wins}</span>
            </div>
            <div className="flex justify-between">
              <span>Derrotas:</span>
              <span className="font-bold text-red-600">{profile.losses}</span>
            </div>
            <div className="flex justify-between">
              <span>Empates:</span>
              <span className="font-bold text-gray-600">{profile.draws}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span>Tasa de victoria:</span>
              <span className="font-bold text-blue-600">{winRate}%</span>
            </div>
          </div>
        </div>

        {/* Buscar Usuarios */}
        {isOwnProfile && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">🔍 Buscar Usuarios</h2>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") void handleSearch();
                }}
              />
              <Button onClick={() => void handleSearch()}>Buscar</Button>
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
                      <div className="text-sm text-gray-600">
                        ELO: {result.elo}
                      </div>
                    </div>
                    <Button onClick={() => void handleSendRequest(result.id)}>
                      Agregar
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-gray-500 text-sm">
                No se encontraron usuarios
              </p>
            )}
          </div>
        )}
      </div>

      {isOwnProfile && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">📜 Historial de Partidas</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ultimas {matchHistory.length} partidas finalizadas
            </span>
          </div>

          {isLoadingHistory ? (
            <p className="text-gray-500 dark:text-gray-400">
              Cargando historial...
            </p>
          ) : matchHistory.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Aun no hay partidas finalizadas para mostrar.
            </p>
          ) : (
            <div className="space-y-3">
              {matchHistory.map((game) => {
                const matchResult = getMatchResult(game);

                return (
                  <div
                    key={game.id}
                    className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          vs {getOpponentLabel(game)}
                        </span>
                        <Badge tone={getMatchResultTone(matchResult)}>
                          {matchResult}
                        </Badge>
                        <Badge tone={game.mode === "ai" ? "warning" : "info"}>
                          {game.mode === "ai" ? "IA" : "Online"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getPlayerColorLabel(game)} • {game.timeControl} •{" "}
                        {new Date(game.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {game.id.slice(0, 8)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isOwnProfile && requests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            📬 Solicitudes de Amistad ({requests.length})
          </h2>
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex justify-between items-center p-3 border rounded"
              >
                <div>
                  <div className="font-medium">{request.username}</div>
                  <div className="text-sm text-gray-600">
                    ELO: {request.elo}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => void handleAcceptRequest(request.id)}>
                    ✓ Aceptar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => void handleRejectRequest(request.id)}
                  >
                    ✗ Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOwnProfile && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            👥 Amigos ({friends.length})
          </h2>
          {friends.length === 0 ? (
            <p className="text-gray-500">No tienes amigos agregados aún.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex-1 flex items-center gap-3">
                    <Avatar
                      src={friend.avatar_url}
                      alt={friend.username}
                      size="sm"
                    />
                    <div>
                      <div className="font-medium">{friend.username}</div>
                      <div className="text-sm text-gray-600">
                        ELO: {friend.elo} •{" "}
                        {friend.is_online ? "En linea" : "Desconectado"}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/profile/${friend.id}`)}
                    >
                      Ver Perfil
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => void handleRemoveFriend(friend.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
