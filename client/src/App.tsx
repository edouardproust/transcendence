import { useEffect } from 'react';
import { AppRouter } from './app/router';
import { useThemeStore } from '@/stores/themeStore';
import { pushToast } from '@/components/ui/ToastProvider';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/features/auth/authStore';
import { connectPresenceSocket, disconnectPresenceSocket } from '@/engine/presenceSocket';


function App() {
  const { theme, setTheme } = useThemeStore();
  const { token, login, logout } = useAuthStore();

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  useEffect(() => {
    if (!token) {
      disconnectPresenceSocket();
      return;
    }

    connectPresenceSocket(token);

    return () => {
      disconnectPresenceSocket();
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    authService
      .getCurrentUser()
      .then((user) => {
        if (!active) return;
        login(user, token);
      })
      .catch((error) => {
        if (!active) return;
        console.error('Session validation failed:', error);
        logout();
        if (!['/login', '/register'].includes(window.location.pathname)) {
          window.location.assign('/login');
        }
      });

    return () => {
      active = false;
    };
  }, [token, login, logout]);

  useEffect(() => {
    const nativeAlert = window.alert;
    window.alert = (message?: any) => {
      pushToast(String(message ?? ''), 'info');
    };
    return () => {
      window.alert = nativeAlert;
    };
  }, []);

  return <AppRouter />;
}

export default App;
