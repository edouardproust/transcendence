export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object') {
    const message = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
};
