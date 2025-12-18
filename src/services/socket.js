import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/env';

let client;
let listeners = {};
let connected = false;

const ensureClient = () => {
  if (!client) client = io(SOCKET_URL, { transports: ['websocket'] });
};

const connect = () => {
  ensureClient();
  if (connected) return;
  client.connect();
  connected = true;
  Object.keys(listeners).forEach(event => {
    listeners[event].forEach(cb => client.on(event, cb));
  });
};

const disconnect = () => {
  if (!client) return;
  client.disconnect();
  connected = false;
};

const on = (event, cb) => {
  if (!listeners[event]) listeners[event] = new Set();
  listeners[event].add(cb);
  ensureClient();
  if (client) client.on(event, cb);
};

const off = (event, cb) => {
  if (listeners[event]) listeners[event].delete(cb);
  if (client) client.off(event, cb);
};

const emit = (event, payload) => {
  ensureClient();
  if (client) client.emit(event, payload);
};

export const socket = { on, off, emit, connect, disconnect };
