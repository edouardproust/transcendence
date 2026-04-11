import { connectSocket, getSocket } from "@/engine/socket";

export type ExitAction = "cancel" | "resign";

export const getSocketErrorMessage = (payload: unknown): string | null => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    return typeof message === "string" ? message : null;
  }
  return null;
};

export const getOrCreateSocket = (token: string | null | undefined) => {
  const existingSocket = getSocket();
  if (existingSocket) {
    if (!existingSocket.connected) existingSocket.connect();
    return existingSocket;
  }
  if (!token) return null;
  return connectSocket(token);
};

export const emitExitAction = (
  action: ExitAction,
  socket: ReturnType<typeof getSocket>,
  gameId: string,
): boolean => {
  if (!socket?.connected) return false;
  socket.emit(action === "cancel" ? "cancelGame" : "resign", gameId);
  return true;
};