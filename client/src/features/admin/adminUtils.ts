import { AdminGame, AdminStats } from '@/types/admin';

type ActivityItem = AdminStats['recentActivity'][number];

export const getAdminGameStatusLabel = (status: string, mode: string) => {
  if (status === 'waiting') {
    return mode === 'ai' ? 'Pendiente inicio' : 'Abierta';
  }
  if (status === 'active') return 'Jugando';
  if (status === 'finished') return 'Finalizada';
  if (status === 'cancelled') return 'Cancelada';
  return status;
};

export const getAdminGameStatusTone = (status: string) => {
  if (status === 'waiting') return 'warning';
  if (status === 'active') return 'success';
  if (status === 'finished') return 'info';
  return 'danger';
};

export const getAdminGameModeLabel = (mode: string) => {
  return mode === 'online' ? '👥 Online' : '🤖 IA';
};

export const getPodiumLabel = (index: number) => {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return index + 1;
};

export const getRecentActivityStatusText = (activity: ActivityItem | AdminGame) => {
  const modeLabel = getAdminGameModeLabel(activity.mode);
  const statusLabel = getAdminGameStatusLabel(activity.status, activity.mode);

  if (activity.status === 'finished') {
    return `${modeLabel} • ${statusLabel}: ${activity.winner_username || 'Tablas'}`;
  }

  return `${modeLabel} • ${statusLabel}`;
};
