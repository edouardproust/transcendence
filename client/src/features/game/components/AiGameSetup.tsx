import React from "react";
import { PlayerColor } from "@/types/game";
import { Button } from "@/components/ui/Button";
import { normalizeAiLevel, normalizePlayerColor } from "../utils/aiGameUtils";

interface AIGameSetupProps {
  aiLevel: number;
  selectedPlayerColor: PlayerColor;
  isStartingGame: boolean;
  onAiLevelChange: (level: number) => void;
  onPlayerColorChange: (color: PlayerColor) => void;
  onStart: () => void;
}

export const AIGameSetup: React.FC<AIGameSetupProps> = ({
  aiLevel,
  selectedPlayerColor,
  isStartingGame,
  onAiLevelChange,
  onPlayerColorChange,
  onStart,
}) => (
  <div className="mb-4 p-4 bg-blue-50 dark:bg-gray-800 border border-blue-200 rounded">
    <h3 className="font-bold mb-2">Configurar dificultad</h3>

    <div className="flex items-center gap-4">
      <label className="text-sm">Nivel (1-20):</label>
      <input
        type="range"
        min="1"
        max="20"
        value={aiLevel}
        onChange={(e) => onAiLevelChange(normalizeAiLevel(e.target.value))}
        className="flex-1"
      />
      <span className="font-bold">{aiLevel}</span>
    </div>
    <p className="text-xs text-gray-600 mt-2">
      Nivel 1 = Basico | 2-7 = Principiante | 8-14 = Intermedio | 15-20 = Maestro
    </p>
    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
      Tus preferencias de dificultad, color y tablero se guardan para la proxima partida.
    </p>

    <div className="mt-3">
      <label className="block text-sm font-medium mb-1">Color de piezas</label>
      <select
        value={selectedPlayerColor}
        onChange={(e) => onPlayerColorChange(normalizePlayerColor(e.target.value))}
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
        disabled={isStartingGame}
      >
        <option value="white">Blancas</option>
        <option value="black">Negras</option>
      </select>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
        Si eliges negras, la IA realiza la primera jugada.
      </p>
    </div>

    <Button className="mt-3" onClick={onStart} disabled={isStartingGame}>
      {isStartingGame ? "Iniciando..." : "Iniciar Partida"}
    </Button>
  </div>
);