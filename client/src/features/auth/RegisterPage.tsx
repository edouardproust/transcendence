import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuthStore } from './authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  AUTH_CONSTRAINTS,
  validateEmail,
  validatePassword,
  validateUsername,
} from './authConstraints';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nextFieldErrors = {
      username: validateUsername(username) ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
    };

    if (nextFieldErrors.username || nextFieldErrors.email || nextFieldErrors.password) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const { user, token } = await authService.register(username.trim(), email.trim(), password);
      
      // Save in store
      login(user, token);
      
      navigate('/lobby');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
      console.error('Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Registrarse</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de usuario"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFieldErrors((current) => ({ ...current, username: undefined }));
            }}
            placeholder="usuario123"
            required
            minLength={AUTH_CONSTRAINTS.username.minLength}
            maxLength={AUTH_CONSTRAINTS.username.maxLength}
            error={fieldErrors.username}
            autoComplete="username"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
            placeholder="tu@email.com"
            required
            error={fieldErrors.email}
            autoComplete="email"
          />
          
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((current) => ({ ...current, password: undefined }));
            }}
            placeholder="••••••••"
            required
            minLength={AUTH_CONSTRAINTS.password.minLength}
            maxLength={AUTH_CONSTRAINTS.password.maxLength}
            error={fieldErrors.password}
            autoComplete="new-password"
          />

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Usuario: 3-30 caracteres, letras, números, guiones o guion bajo. Contraseña: mínimo
            12 caracteres, con mayúscula, minúscula, número y carácter especial.
          </p>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};
