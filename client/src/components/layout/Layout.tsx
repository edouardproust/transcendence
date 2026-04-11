import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { connectPresenceSocket } from '@/engine/presenceSocket';
import { useAuthStore } from '@/features/auth/authStore';
import { pushToast } from '@/components/ui/ToastProvider';
import { GameInvitePayload } from '@/types/invite';
import { GameInviteModal } from './GameInviteModal';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [pendingInvite, setPendingInvite] = useState<GameInvitePayload | null>(null);

  useEffect(() => {
    if (!token) {
      setPendingInvite(null);
      return;
    }

    const socket = connectPresenceSocket(token);
    const handleGameInvite = (invite: GameInvitePayload) => {
      setPendingInvite(invite);
      pushToast(`${invite.inviter.username} te invito a jugar`, 'info');
    };

    socket.on('game_invite', handleGameInvite);

    return () => {
      socket.off('game_invite', handleGameInvite);
    };
  }, [token]);

  const handleAcceptInvite = () => {
    if (!pendingInvite) return;

    const nextRoute = pendingInvite.gameUrl || `/game/${pendingInvite.gameId}`;
    setPendingInvite(null);
    navigate(nextRoute);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      <Navbar />
      <main className="container mx-auto p-4">
        {children}
      </main>
      <GameInviteModal
        invite={pendingInvite}
        onAccept={handleAcceptInvite}
        onClose={() => setPendingInvite(null)}
      />
    </div>
  );
};
