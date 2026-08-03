import { io } from "socket.io-client";
import { fetchSocketToken } from "../services/api/socketService";
import { runtimeConfig } from "../utils/runtimeConfig";

const SOCKET_SERVER_URL = runtimeConfig.socketServerUrl;

const socket = io(SOCKET_SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  transports: ["websocket"],
  auth: {
    token: "",
  },
});

let pendingTokenRequest: Promise<string> | null = null;
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

const TOKEN_CACHE_TTL_MS = 45_000; // 45 seconds memory cache

const getFreshToken = async (forceRefresh = false): Promise<string> => {
  const now = Date.now();
  if (!forceRefresh && cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  if (pendingTokenRequest) {
    return pendingTokenRequest;
  }

  pendingTokenRequest = fetchSocketToken()
    .then((token) => {
      cachedToken = token;
      tokenExpiresAt = Date.now() + TOKEN_CACHE_TTL_MS;
      return token;
    })
    .finally(() => {
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
  const token = await getFreshToken(true);
  socket.auth = { token };

  if (socket.connected) {
    socket.disconnect();
  }

  socket.connect();
};

export default socket;
