import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/userService';
import { UserProfile } from '@/types/user';

interface UseProfileOptions {
  userId?: string;
  autoLoad?: boolean;
}

export const useProfile = (options: UseProfileOptions = {}) => {
  const { userId, autoLoad = true } = options;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getProfile(userId);
      setProfile(data);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Error cargando perfil');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoLoad) {
      void loadProfile();
    }
  }, [autoLoad, loadProfile]);

  const updateProfile = async (data: { username: string; email: string }) => {
    const updated = await userService.updateProfile(data);
    setProfile(updated);
    return updated;
  };

  const uploadAvatar = async (file: File) => {
    const result = await userService.uploadAvatar(file);
    setProfile((prev) => (prev ? { ...prev, avatar_url: result.avatar_url } : prev));
    return result;
  };

  return {
    profile,
    isLoading,
    error,
    loadProfile,
    updateProfile,
    uploadAvatar,
    setProfile,
  };
};
