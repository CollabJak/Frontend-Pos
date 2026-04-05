import { io } from "socket.io-client";
import { fetchSocketToken } from "../services/api/socketService";
import { runtimeConfig } from "../utils/runtimeConfig";

const SOCKET_SERVER_URL = runtimeConfig.socketServerUrl;

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

const getFreshToken = async (): Promise<string> => {
  if (pendingTokenRequest) {
    return pendingTokenRequest;
  }

  pendingTokenRequest = fetchSocketToken().finally(() => {
    pendingTokenRequest = null;
  });

  return pendingTokenRequest;
};

export const connectSocketWithToken = async (): Promise<void> => {
  const token = await getFreshToken();
  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }
};

export const refreshSocketTokenAndReconnect = async (): Promise<void> => {
  const token = await getFreshToken();
  socket.auth = { token };

  if (socket.connected) {
    socket.disconnect();
  }

  socket.connect();
};

export default socket;
