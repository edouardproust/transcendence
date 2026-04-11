export const getStatusLabel = (status: string, mode: string): string => {
  const labels: Record<string, string> = {
    active: 'Jugando',
    finished: 'Finalizada',
    cancelled: 'Cancelada',
  };

  if (status === 'waiting' && mode === 'ai') return 'Pendiente inicio';
  if (status === 'waiting') return 'Abierta';
  return labels[status] || status;
};

export const getStatusTone = (
  status: string,
): 'warning' | 'success' | 'info' | 'danger' => {
  const tones: Record<string, 'warning' | 'success' | 'info' | 'danger'> = {
    waiting: 'warning',
    active: 'success',
    finished: 'info',
    cancelled: 'danger',
  };
  return tones[status] || 'info';
};
