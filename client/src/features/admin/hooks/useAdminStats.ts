import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { AdminStats } from '@/types/admin';

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      const backendMessage = error.response?.data?.message;
      setStats(null);
      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || 'No se pudieron cargar las estadísticas.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const retry = () => {
    void loadStats();
  };

  return {
    stats,
    isLoading,
    errorMessage,
    retry,
  };
};
