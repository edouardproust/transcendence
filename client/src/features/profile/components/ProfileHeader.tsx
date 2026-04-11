import { UserProfile } from '@/types/user';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  isEditing: boolean;
  isUploadingAvatar: boolean;
  onEditClick: () => void;
  onAvatarUpload: (file: File) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  isUploadingAvatar,
  onEditClick,
  onAvatarUpload,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-4">
          <Avatar src={profile.avatar_url} alt="Avatar" size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {profile.username}
            </h1>
            {profile.email && (
              <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
            )}
            <div className="mt-1">
              <Badge tone={profile.is_online ? 'success' : 'neutral'}>
                {profile.is_online ? 'En linea' : 'Desconectado'}
              </Badge>
            </div>
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

      {isOwnProfile && (
        <div className="flex gap-2">
          <label className="px-4 py-2 rounded-lg font-medium transition bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white cursor-pointer">
            {isUploadingAvatar ? 'Subiendo...' : 'Subir Avatar'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onAvatarUpload(file);
              }}
            />
          </label>
          <button
            type="button"
            onClick={onEditClick}
            className="px-4 py-2 rounded-lg font-medium transition bg-blue-600 hover:bg-blue-700 text-white"
          >
            Editar Perfil
          </button>
        </div>
      )}
    </div>
  );
};
