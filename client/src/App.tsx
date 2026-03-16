import { useEffect } from 'react';
import { AppRouter } from './app/router';
import { useThemeStore } from '@/stores/themeStore';
import { pushToast } from '@/components/ui/ToastProvider';

function App() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Apply saved theme
    setTheme(theme);
  }, [theme, setTheme]);

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
