import { userService } from '@/services/userService';
import { friendsService } from '@/services/friendsService';
import { Friend } from '@/types/friends';
import { getApiErrorMessage } from '@/utils/apiError';
import { pushToast } from '@/components/ui/ToastProvider';

export const searchUsers = async (query: string): Promise<Friend[]> => {
  return userService.searchUsers(query);
};

export const filterSearchResults = (
  results: Friend[],
  currentUserId: string | undefined,
  friendIds: Set<string>,
  pendingSenderIds: Set<string>,
): Friend[] => {
  return results.filter(
    (result) =>
      result.id !== currentUserId &&
      !friendIds.has(result.id) &&
      !pendingSenderIds.has(result.id),
  );
};

export const handleUserSearch = async (
  query: string,
  currentUserId: string | undefined,
  friends: Friend[],
  requests: { sender_id: string }[],
): Promise<Friend[]> => {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    pushToast('Ingresa al menos 2 caracteres', 'error');
    return [];
  }

  try {
    const results = await searchUsers(normalizedQuery);
    const friendIds = new Set(friends.map((friend) => friend.id));
    const pendingSenderIds = new Set(requests.map((request) => request.sender_id));

    return filterSearchResults(results, currentUserId, friendIds, pendingSenderIds);
  } catch (error) {
    console.error('Error searching users:', error);
    pushToast('Error buscando usuarios', 'error');
    throw error;
  }
};

export const sendFriendRequest = async (receiverId: string): Promise<void> => {
  await friendsService.sendFriendRequest(receiverId);
};

export const handleSendFriendRequest = async (
  receiverId: string,
  currentUserId: string | undefined,
): Promise<void> => {
  if (receiverId === currentUserId) {
    pushToast('No puedes enviarte una solicitud a ti mismo', 'error');
    return;
  }

  try {
    await sendFriendRequest(receiverId);
    pushToast('Solicitud enviada', 'success');
  } catch (error: any) {
    pushToast(getApiErrorMessage(error, 'Error enviando solicitud'), 'error');
    throw error;
  }
};

export const removeFriendRequest = async (friendId: string): Promise<void> => {
  await friendsService.removeFriend(friendId);
};

export const handleRemoveFriend = async (
  friendId: string,
  removeFriend: (friendId: string) => Promise<void>,
): Promise<void> => {
  if (!confirm('¿Eliminar este amigo?')) {
    return;
  }

  try {
    await removeFriend(friendId);
    pushToast('Amigo eliminado', 'success');
  } catch (error) {
    pushToast('Error eliminando amigo', 'error');
    throw error;
  }
};
