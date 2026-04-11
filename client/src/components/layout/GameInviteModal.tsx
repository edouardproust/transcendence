import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { GameInvitePayload } from '@/types/invite';

interface GameInviteModalProps {
  invite: GameInvitePayload | null;
  onAccept: () => void;
  onClose: () => void;
}

export const GameInviteModal: React.FC<GameInviteModalProps> = ({
  invite,
  onAccept,
  onClose,
}) => {
  if (!invite) return null;

  return (
    <Modal isOpen={Boolean(invite)} onClose={onClose} title="Invitacion a jugar">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
          <Avatar src={invite.inviter.avatarUrl} alt={invite.inviter.username} size="md" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{invite.inviter.username}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              te ha invitado a una partida online.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white/70 p-4 text-sm dark:border-gray-700 dark:bg-gray-900/40">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            Ritmo: {invite.timeControl}
          </p>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Al aceptar entraras directamente en la partida.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={onAccept} className="w-full">
            Aceptar e ir al juego
          </Button>
          <Button variant="secondary" onClick={onClose} className="w-full">
            Ahora no
          </Button>
        </div>
      </div>
    </Modal>
  );
};
