import { useState, useCallback } from 'react';
import { userService } from '@/services/userService';
import { Friend } from '@/types/friends';

export const useUserSearch = (friends: Friend[], requests: { sender_id: string }[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);

  const friendIds = new Set(friends.map((friend) => friend.id));
  const pendingSenderIds = new Set(requests.map((request) => request.sender_id));

  const search = useCallback(async () => {
    const normalizedQuery = searchQuery.trim();

    if (normalizedQuery.length < 2) {
      return;
    }

    try {
      const results = await userService.searchUsers(normalizedQuery);
      setSearchResults(
        results.filter(
          (result) =>
            !friendIds.has(result.id) && !pendingSenderIds.has(result.id),
        ),
      );
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }, [searchQuery, friendIds, pendingSenderIds]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    search,
    clearSearch,
  };
};
