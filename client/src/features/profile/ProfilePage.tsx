import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/features/auth/authStore';
import { UserProfile } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: '', email: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const data = await userService.getProfile(userId);
      setProfile(data);
      setEditData({ username: data.username, email: data.email });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updated = await userService.updateProfile(editData);
      setProfile(updated);
      setIsEditing(false);
      alert('Perfil actualizado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error actualizando perfil');
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploadingAvatar(true);
      const result = await userService.uploadAvatar(file);
      setProfile((prev) => (prev ? { ...prev, avatar_url: result.avatar_url } : prev));
      alert('Avatar actualizado');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error subiendo avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Perfil no encontrado</div>
      </div>
    );
  }

  const winRate = profile.totalGames > 0 
    ? ((profile.wins / profile.totalGames) * 100).toFixed(1) 
    : '0';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Información del Perfil */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-4">
            <Avatar src={profile.avatar_url} alt="Avatar" size="lg" />
            <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {profile.username}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Miembro desde {new Date(profile.created_at).toLocaleDateString()}
            </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {profile.elo}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">ELO Rating</div>
          </div>
        </div>

        {isOwnProfile && !isEditing && (
          <div className="flex gap-2">
            <label className="px-4 py-2 rounded-lg font-medium transition bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white cursor-pointer">
              {isUploadingAvatar ? 'Subiendo...' : 'Subir Avatar'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleAvatarUpload(file);
                }}
              />
            </label>
            <Button onClick={() => setIsEditing(true)}>Editar Perfil</Button>
          </div>
        )}

        {isEditing && (
          <div className="mt-4 space-y-3">
            <Input
              label="Nombre de usuario"
              value={editData.username}
              onChange={(e) => setEditData({ ...editData, username: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleUpdateProfile}>Guardar</Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Estadísticas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">📊 Estadísticas</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Partidas totales:</span>
              <span className="font-bold">{profile.totalGames}</span>
            </div>
            <div className="flex justify-between">
              <span>Victorias:</span>
              <span className="font-bold text-green-600">{profile.wins}</span>
            </div>
            <div className="flex justify-between">
              <span>Derrotas:</span>
              <span className="font-bold text-red-600">{profile.losses}</span>
            </div>
            <div className="flex justify-between">
              <span>Empates:</span>
              <span className="font-bold text-gray-600">{profile.draws}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span>Tasa de victoria:</span>
              <span className="font-bold text-blue-600">{winRate}%</span>
            </div>
          </div>
        </div>

        {/* Buscar Usuarios */}
        {isOwnProfile && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">🔍 Buscar Usuarios</h2>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                >Buscar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
