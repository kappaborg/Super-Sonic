import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from '@/lib/websocket/server';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    throw new Error('Socket.IO client has not been initialized');
  }
  return socket;
}

export function initSocketClient(token: string): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    socket = io(url, {
      path: '/api/ws',
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });

    // Handle connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Helper functions for common WebSocket operations

export function joinMeeting(meetingId: string, userId: string, name: string): void {
  const socket = getSocket();
  socket.emit('joinMeeting', { meetingId, userId, name });
}

export function leaveMeeting(meetingId: string, userId: string): void {
  const socket = getSocket();
  socket.emit('leaveMeeting', { meetingId, userId });
}

export function submitVoiceAuth(
  meetingId: string,
  userId: string,
  voiceSample: Float32Array
): void {
  const socket = getSocket();
  socket.emit('submitVoiceAuth', { meetingId, userId, voiceSample });
}

export function sendMessage(meetingId: string, message: string): void {
  const socket = getSocket();
  socket.emit('sendMessage', { meetingId, message });
}

// Custom hooks for WebSocket events
export function useSocketListener<K extends keyof ServerToClientEvents>(
  event: K,
  callback: ServerToClientEvents[K]
): void {
  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      throw new Error('Socket.IO client has not been initialized');
    }

    // Type assertion to handle Socket.IO's internal types
    socket.on(event, callback as any);
    
    return () => {
      socket?.off(event, callback as any);
    };
  }, [event, callback]);
} 