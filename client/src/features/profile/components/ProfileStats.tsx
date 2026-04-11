import { UserProfile } from '@/types/user';

interface ProfileStatsProps {
  profile: UserProfile;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ profile }) => {
  const winRate =
    profile.totalGames > 0
      ? ((profile.wins / profile.totalGames) * 100).toFixed(1)
      : '0';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">📊 Estadisticas</h2>
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
  );
};
