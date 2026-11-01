import type { SocketCommand, SocketMessage } from './interfaces/socket-message';
import { session } from './session';
import { refreshSession } from './thingsboard-client';

export type SocketStatus = 'connecting' | 'connected' | 'disconnected';

interface Subscription {
  command: SocketCommand;
  onMessage: (message: SocketMessage) => void;
}

const SOCKET_URL = `${import.meta.env.VITE_TB_API_URL.replace(/^http/, 'ws')}/api/ws`;
const MAX_RECONNECT_DELAY_MS = 30_000;
const IDLE_CLOSE_DELAY_MS = 1_000;

let socket: WebSocket | null = null;
let status: SocketStatus = 'disconnected';
let nextCmdId = 1;
let reconnectAttempts = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
let idleTimer: ReturnType<typeof setTimeout> | undefined;
const subscriptions = new Map<number, Subscription>();
const statusListeners = new Set<() => void>();

const setStatus = (nextStatus: SocketStatus) => {
  status = nextStatus;
  statusListeners.forEach((listener) => listener());
};

const tokenExpiresSoon = (token: string) => {
  const { exp } = JSON.parse(atob(token.split('.')[1]));
  return exp * 1000 - Date.now() < 60_000;
};

const toCommand = (cmdId: number, { command }: Subscription) => ({ ...command, cmdId });

const send = (cmds: SocketCommand[]) => {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ cmds }));
};

const connect = async () => {
  if (socket || status === 'connecting' || !subscriptions.size) return;

  let token = session.getToken();
  if (!token) return;

  setStatus('connecting');

  if (tokenExpiresSoon(token)) {
    try {
      token = (await refreshSession()).token;
    } catch {
      setStatus('disconnected');
      return;
    }
  }

  const authToken = token;
  socket = new WebSocket(SOCKET_URL);

  socket.onopen = () => {
    reconnectAttempts = 0;
    setStatus('connected');
    socket?.send(JSON.stringify({
      authCmd: { cmdId: 0, token: authToken },
      cmds: [...subscriptions].map(([cmdId, subscription]) => toCommand(cmdId, subscription)),
    }));
  };

  socket.onmessage = (event) => {
    const message: SocketMessage = JSON.parse(event.data);
    subscriptions.get(message.cmdId)?.onMessage(message);
  };

  socket.onclose = () => {
    socket = null;
    setStatus('disconnected');
    if (!subscriptions.size) return;

    const delay = Math.min(1000 * 2 ** reconnectAttempts++, MAX_RECONNECT_DELAY_MS);
    reconnectTimer = setTimeout(connect, delay);
  };
};

export const thingsboardSocket = {
  subscribe: (command: SocketCommand, onMessage: (message: SocketMessage) => void) => {
    const cmdId = nextCmdId++;
    const subscription = { command, onMessage };

    clearTimeout(idleTimer);
    subscriptions.set(cmdId, subscription);

    if (socket) send([toCommand(cmdId, subscription)]);
    else connect();

    return () => {
      subscriptions.delete(cmdId);
      send([{ type: `${command.type}_UNSUBSCRIBE`, cmdId }]);

      // Closes when nothing is listening anymore (the delay avoids reconnecting on quick remounts)
      if (!subscriptions.size) idleTimer = setTimeout(thingsboardSocket.disconnect, IDLE_CLOSE_DELAY_MS);
    };
  },

  disconnect: () => {
    clearTimeout(reconnectTimer);
    subscriptions.clear();
    socket?.close();
  },

  getStatus: () => status,

  onStatusChange: (listener: () => void) => {
    statusListeners.add(listener);
    return () => {
      statusListeners.delete(listener);
    };
  },
};
