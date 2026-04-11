import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { Friend } from '@/types/friends';
import { useProfile } from './hooks/useProfile';
import { useFriends } from './hooks/useFriends';
import { useMatchHistory } from './hooks/useMatchHistory';
import { useUserSearch } from './hooks/useUserSearch';
import { usePresence } from './hooks/usePresence';
import {
  handleProfileUpdate,
  handleAvatarUpload,
} from './utils/profileHandlers';
import { handleUserSearch, handleSendFriendRequest, handleRemoveFriend } from './utils/friendsHandlers';
import {
  ProfileHeader,
  ProfileStats,
  UserSearch,
  FriendList,
  FriendRequests,
  MatchHistory,
  EditProfileForm,
} from './components';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuthStore();
  const isOwnProfile = !userId || userId === user?.id;

  const { profile, setProfile, isLoading: isLoadingProfile, loadProfile } = useProfile({
    userId,
    autoLoad: false,
  });
  const { friends, requests, acceptRequest, rejectRequest, removeFriend, setRequests } = useFriends();
  const { matchHistory, isLoading: isLoadingHistory } = useMatchHistory();
  const { searchQuery, setSearchQuery, clearSearch } = useUserSearch(friends, requests);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: '', email: '' });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editErrors, setEditErrors] = useState<{
    username?: string;
    email?: string;
  }>({});

  const [searchApplied, setSearchApplied] = useState<Friend[]>([]);

  usePresence({
    onUserStatus: (targetUserId, isOnline, lastSeen) => {
      setProfile((prev) =>
        prev && prev.id === targetUserId
          ? { ...prev, is_online: isOnline, last_seen: lastSeen }
          : prev,
      );
      setRequests((prev) =>
        prev.map((request) =>
          request.sender_id === targetUserId
            ? { ...request, is_online: isOnline, last_seen: lastSeen }
            : request,
        ),
      );
      setSearchApplied((prev) =>
        prev.map((result) =>
          result.id === targetUserId
            ? { ...result, is_online: isOnline, last_seen: lastSeen }
            : result,
        ),
      );
    },
  });

  useEffect(() => {
    void loadProfile();
  }, [userId, loadProfile]);

  useEffect(() => {
    if (profile) {
      setEditData({ username: profile.username, email: profile.email ?? '' });
    }
  }, [profile]);

  useEffect(() => {
    if (!isOwnProfile) {
      clearSearch();
    }
  }, [isOwnProfile, clearSearch]);

  const onUpdateProfile = () => {
    void handleProfileUpdate(editData, setProfile, setEditErrors, setIsEditing);
  };

  const onAvatarUpload = (file: File) => {
    setIsUploadingAvatar(true);
    void handleAvatarUpload(file, setProfile).finally(() => setIsUploadingAvatar(false));
  };

  const onSearch = async () => {
    const results = await handleUserSearch(searchQuery, user?.id, friends, requests);
    setSearchApplied(results);
  };

  const onSendRequest = async (receiverId: string) => {
    await handleSendFriendRequest(receiverId, user?.id);
    setSearchApplied([]);
    setSearchQuery('');
  };

  const onRemoveFriend = async (friendId: string) => {
    await handleRemoveFriend(friendId, removeFriend);
  };

  if (isLoadingProfile) {
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

  return (
    <div className="max-w-6xl mx-auto">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isEditing={isEditing}
        isUploadingAvatar={isUploadingAvatar}
        onEditClick={() => setIsEditing(true)}
        onAvatarUpload={onAvatarUpload}
      />

      {isEditing && (
        <EditProfileForm
          editData={editData}
          editErrors={editErrors}
          onChange={(field, value) => {
            setEditData({ ...editData, [field]: value });
            setEditErrors((current) => ({ ...current, [field]: undefined }));
          }}
          onSave={onUpdateProfile}
          onCancel={() => setIsEditing(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ProfileStats profile={profile} />

        {isOwnProfile && (
          <UserSearch
            searchQuery={searchQuery}
            searchResults={searchApplied}
            onSearchQueryChange={setSearchQuery}
            onSearch={onSearch}
            onSendRequest={onSendRequest}
          />
        )}
      </div>

      {isOwnProfile && (
        <MatchHistory
          games={matchHistory}
          currentUserId={user?.id}
          isLoading={isLoadingHistory}
        />
      )}

      {isOwnProfile && (
        <FriendRequests requests={requests} onAccept={acceptRequest} onReject={rejectRequest} />
      )}

      {isOwnProfile && <FriendList friends={friends} onRemoveFriend={onRemoveFriend} />}
    </div>
  );
};
