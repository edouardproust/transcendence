import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { friendsService } from "@/services/friendsService";
import { gameService } from "@/services/gameService";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/features/auth/authStore";
import { UserProfile } from "@/types/user";
import { Friend, FriendRequest } from "@/types/friends";
import { Game } from "@/types/game";
import { PageLoader } from "@/components/ui/PageState";
import { pushToast } from "@/components/ui/ToastProvider";
import { connectPresenceSocket } from "@/engine/presenceSocket";
import {
  validateEmail,
  validateUsername,
} from "@/features/auth/authConstraints";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  ProfileFriendsSection,
  ProfileMatchHistorySection,
  ProfileRequestsSection,
  ProfileSearchSection,
  ProfileStatsSection,
  ProfileSummarySection,
} from "./ProfileSections";
import { getWinRate } from "./profileUtils";

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
    return <PageLoader message="Cargando perfil..." />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Perfil no encontrado</div>
      </div>
    );
  }

  const winRate = getWinRate(profile);
  const handleEditDataChange = (field: "username" | "email", value: string) => {
    setEditData((current) => ({ ...current, [field]: value }));
    setEditErrors((current) => ({ ...current, [field]: undefined }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <ProfileSummarySection
        profile={profile}
        isOwnProfile={isOwnProfile}
        isEditing={isEditing}
        isUploadingAvatar={isUploadingAvatar}
        editData={editData}
        editErrors={editErrors}
        onEditDataChange={handleEditDataChange}
        onStartEditing={() => setIsEditing(true)}
        onCancelEditing={() => setIsEditing(false)}
        onSave={handleUpdateProfile}
        onAvatarUpload={(file) => void handleAvatarUpload(file)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ProfileStatsSection profile={profile} winRate={winRate} />
        {isOwnProfile ? (
          <ProfileSearchSection
            searchQuery={searchQuery}
            searchResults={searchResults}
            onSearchQueryChange={setSearchQuery}
            onSearch={() => void handleSearch()}
            onSendRequest={(receiverId) => void handleSendRequest(receiverId)}
          />
        ) : null}
      </div>

      {isOwnProfile ? (
        <ProfileMatchHistorySection
          matchHistory={matchHistory}
          isLoadingHistory={isLoadingHistory}
          currentUserId={user?.id}
        />
      ) : null}

      {isOwnProfile ? (
        <ProfileRequestsSection
          requests={requests}
          onAccept={(requestId) => void handleAcceptRequest(requestId)}
          onReject={(requestId) => void handleRejectRequest(requestId)}
        />
      ) : null}

      {isOwnProfile ? (
        <ProfileFriendsSection
          friends={friends}
          onViewProfile={(friendId) => navigate(`/profile/${friendId}`)}
          onRemoveFriend={(friendId) => void handleRemoveFriend(friendId)}
        />
      ) : null}
    </div>
  );
};
