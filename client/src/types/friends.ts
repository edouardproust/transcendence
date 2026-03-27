export interface Friend {
  id: string;
  username: string;
  email?: string;
  elo: number;
  avatar_url?: string | null;
  is_online?: boolean;
  last_seen?: string | null;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  username: string;
  elo: number;
  avatar_url?: string | null;
  is_online?: boolean;
  last_seen?: string | null;
  created_at: string;
}
