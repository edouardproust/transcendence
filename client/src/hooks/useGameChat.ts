import { useState } from "react";
import { getSocket } from "@/engine/socket";

interface ChatMessage {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

interface UseGameChatOptions {
  gameId: string;
  currentUser: { id: string; username: string } | null;
  isLeavingGame: boolean;
}

export const useGameChat = ({
  gameId,
  currentUser,
  isLeavingGame,
}: UseGameChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const onChatMessage = (data: ChatMessage) => {
    setMessages((prev) => [...prev.slice(-49), data]);
  };

  const handleSendMessage = () => {
    if (isLeavingGame) return;
    const text = chatInput.trim();
    if (!text) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("chatMessage", { gameId, message: text });

    setMessages((prev) => [
      ...prev.slice(-49),
      {
        userId: currentUser?.id || "",
        username: currentUser?.username || "",
        message: text,
        timestamp: new Date().toISOString(),
      },
    ]);

    setChatInput("");
  };

  return {
    messages,
    chatInput,
    setChatInput,
    onChatMessage,
    handleSendMessage,
  };
};