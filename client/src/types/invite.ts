export interface GameInvitePayload {
  gameId: string;
  gameUrl: string;
  timeControl: string;
  createdAt: string;
  inviter: {
    id: string;
    username: string;
    avatarUrl?: string | null;
    elo: number;
  };
}
