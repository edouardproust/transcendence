import React from "react";
import { Button } from "@/components/ui/Button";

interface DrawOfferBannerProps {
  isLeavingGame: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const DrawOfferBanner: React.FC<DrawOfferBannerProps> = ({
  isLeavingGame,
  onAccept,
  onDecline,
}) => (
  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
    <p className="font-bold text-yellow-900 mb-3">
      🤝 Tu oponente ha ofrecido tablas
    </p>
    <div className="flex gap-3">
      <Button onClick={onAccept} disabled={isLeavingGame}>
        ✓ Aceptar Tablas
      </Button>
      <Button variant="danger" onClick={onDecline} disabled={isLeavingGame}>
        ✗ Rechazar
      </Button>
    </div>
  </div>
);