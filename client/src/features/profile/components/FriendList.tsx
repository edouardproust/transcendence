import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Friend } from '@/types/friends';

interface FriendListProps {
  friends: Friend[];
  onRemoveFriend: (friendId: string) => void;
}

export const FriendList: React.FC<FriendListProps> = ({ friends, onRemoveFriend }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">👥 Amigos ({friends.length})</h2>
      {friends.length === 0 ? (
        <p className="text-gray-500">No tienes amigos agregados aun.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
            >
              <div className="flex-1 flex items-center gap-3">
                <Avatar src={friend.avatar_url} alt={friend.username} size="sm" />
                <div>
                  <div className="font-medium">{friend.username}</div>
                  <div className="text-sm text-gray-600">
                    ELO: {friend.elo} • {friend.is_online ? 'En linea' : 'Desconectado'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/profile/${friend.id}`)}
                >
                  Ver Perfil
                </Button>
                <Button variant="danger" onClick={() => void onRemoveFriend(friend.id)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
