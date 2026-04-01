import { io } from "socket.io-client";
import { fetchSocketToken } from "../services/api/socketService";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL ?? "http://localhost:3001";

const socket = io(SOCKET_SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000,
  transports: ["websocket", "polling"],
  auth: {
    token: "",
  },
});

let pendingTokenRequest: Promise<string> | null = null;

const getFreshToken = async (deviceId: string): Promise<string> => {
  if (pendingTokenRequest) {
    return pendingTokenRequest;
  }

  pendingTokenRequest = fetchSocketToken(deviceId).finally(() => {
    pendingTokenRequest = null;
  });

  return pendingTokenRequest;
};

export const connectSocketWithToken = async (deviceId: string): Promise<void> => {
  const token = await getFreshToken(deviceId);
  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }
};

export const refreshSocketTokenAndReconnect = async (deviceId: string): Promise<void> => {
  const token = await getFreshToken(deviceId);
  socket.auth = { token };

  if (socket.connected) {
    socket.disconnect();
  }

  socket.connect();
};

export default socket;
