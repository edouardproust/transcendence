import { useState } from "react";
import { getSocket } from "@/engine/socket";
import { pushToast } from "@/components/ui/ToastProvider";

interface UseDrawOfferOptions {
  gameId: string;
  status: string;
  hasOpponent: boolean;
  isLeavingGame: boolean;
}

export const useDrawOffer = ({
  gameId,
  status,
  hasOpponent,
  isLeavingGame,
}: UseDrawOfferOptions) => {
  const [drawOffered, setDrawOffered] = useState(false);
  const [drawOfferFrom, setDrawOfferFrom] = useState<string | null>(null);

  const resetDrawState = () => {
    setDrawOffered(false);
    setDrawOfferFrom(null);
  };

  const onDrawOffered = (data: { playerId: string }) => {
    setDrawOfferFrom(data.playerId);
  };

  const onDrawDeclined = () => {
    setDrawOffered(false);
    setDrawOfferFrom(null);
    pushToast("Tu oponente rechazó las tablas", "info");
  };

  const handleOfferDraw = () => {
    if (isLeavingGame) return;
    const socket = getSocket();
    if (socket && status === "active" && hasOpponent && !drawOffered) {
      socket.emit("offerDraw", gameId);
      setDrawOffered(true);
      pushToast("Oferta de tablas enviada al oponente", "success");
    }
  };

  const handleAcceptDraw = () => {
    if (isLeavingGame) return;
    const socket = getSocket();
    if (socket && drawOfferFrom) {
      socket.emit("acceptDraw", gameId);
      setDrawOfferFrom(null);
    }
  };

  const handleDeclineDraw = () => {
    if (isLeavingGame) return;
    const socket = getSocket();
    if (socket) {
      socket.emit("declineDraw", gameId);
    }
    setDrawOfferFrom(null);
  };

  return {
    drawOffered,
    drawOfferFrom,
    resetDrawState,
    onDrawOffered,
    onDrawDeclined,
    handleOfferDraw,
    handleAcceptDraw,
    handleDeclineDraw,
  };
};