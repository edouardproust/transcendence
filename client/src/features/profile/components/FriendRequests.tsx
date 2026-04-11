import { Button } from '@/components/ui/Button';
import { FriendRequest } from '@/types/friends';

interface FriendRequestsProps {
  requests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const FriendRequests: React.FC<FriendRequestsProps> = ({
  requests,
  onAccept,
  onReject,
}) => {
  if (requests.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">
        📬 Solicitudes de Amistad ({requests.length})
      </h2>
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex justify-between items-center p-3 border rounded"
          >
            <div>
              <div className="font-medium">{request.username}</div>
              <div className="text-sm text-gray-600">ELO: {request.elo}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void onAccept(request.id)}>✓ Aceptar</Button>
              <Button variant="danger" onClick={() => void onReject(request.id)}>
                ✕ Rechazar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
