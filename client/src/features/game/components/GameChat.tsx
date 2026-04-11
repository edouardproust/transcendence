import React from "react";
import { Button } from "@/components/ui/Button";

interface ChatMessage {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

interface GameChatProps {
  messages: ChatMessage[];
  chatInput: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export const GameChat: React.FC<GameChatProps> = ({
  messages,
  chatInput,
  onInputChange,
  onSend,
}) => (
  <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
    <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100">Chat</h3>
    <div className="h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2 mb-2 bg-gray-50 dark:bg-gray-900">
      {messages.length === 0 ? (
        <p className="text-sm text-gray-500">Sin mensajes todavía.</p>
      ) : (
        messages.map((m, idx) => (
          <div key={`${m.timestamp}-${idx}`} className="text-sm mb-1">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {m.username}:{" "}
            </span>
            <span className="text-gray-800 dark:text-gray-200">{m.message}</span>
          </div>
        ))
      )}
    </div>
    <div className="flex gap-2">
      <input
        value={chatInput}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSend();
        }}
        placeholder="Escribe un mensaje..."
        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      <Button onClick={onSend}>Enviar</Button>
    </div>
  </div>
);