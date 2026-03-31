import { io } from "socket.io-client";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL ?? "http://localhost:3001";

const socket = io(SOCKET_SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000,
  transports: ["websocket", "polling"],
});

export default socket;

