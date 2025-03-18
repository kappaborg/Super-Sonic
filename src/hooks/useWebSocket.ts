import {
    disconnectSocket,
    initSocketClient
} from '@/lib/websocket/client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/lib/websocket/server';
import { useCallback, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  token: string;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: { code: string; message: string }) => void;
}

interface UseWebSocketReturn {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket({
  token,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(() => {
    try {
      const newSocket = initSocketClient(token);
      setSocket(newSocket);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
    }
  }, [token]);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!socket) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      onConnect?.();
    };

    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      onDisconnect?.(reason);
    };

    const handleError = (err: { code: string; message: string }) => {
      setError(new Error(err.message));
      onError?.(err);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
    };
  }, [socket, onConnect, onDisconnect, onError]);

  return {
    socket,
    isConnected,
    error,
    connect,
    disconnect,
  };
}

// Meeting-specific WebSocket hook
interface UseMeetingWebSocketOptions extends UseWebSocketOptions {
  meetingId: string;
  userId: string;
  userName: string;
  onParticipantJoined?: (data: {
    meetingId: string;
    userId: string;
    name: string;
  }) => void;
  onParticipantLeft?: (data: {
    meetingId: string;
    userId: string;
  }) => void;
  onMeetingStateUpdate?: (data: {
    meetingId: string;
    status: string;
    participants: any[];
  }) => void;
  onVoiceAuthRequired?: (data: {
    meetingId: string;
    userId: string;
  }) => void;
  onVoiceAuthResult?: (data: {
    meetingId: string;
    userId: string;
    success: boolean;
    message?: string;
  }) => void;
  onChatMessage?: (data: {
    meetingId: string;
    userId: string;
    name: string;
    message: string;
    timestamp: number;
  }) => void;
}

export function useMeetingWebSocket({
  token,
  meetingId,
  userId,
  userName,
  onConnect,
  onDisconnect,
  onError,
  onParticipantJoined,
  onParticipantLeft,
  onMeetingStateUpdate,
  onVoiceAuthRequired,
  onVoiceAuthResult,
  onChatMessage,
}: UseMeetingWebSocketOptions) {
  const { socket, isConnected, error } = useWebSocket({
    token,
    onConnect: () => {
      // Join meeting when connected
      if (socket) {
        socket.emit('joinMeeting', { meetingId, userId, name: userName });
      }
      onConnect?.();
    },
    onDisconnect,
    onError,
  });

  // Set up event listeners
  useEffect(() => {
    if (!socket) return;

    if (onParticipantJoined) {
      socket.on('participantJoined', onParticipantJoined);
    }
    if (onParticipantLeft) {
      socket.on('participantLeft', onParticipantLeft);
    }
    if (onMeetingStateUpdate) {
      socket.on('meetingStateUpdate', onMeetingStateUpdate);
    }
    if (onVoiceAuthRequired) {
      socket.on('voiceAuthRequired', onVoiceAuthRequired);
    }
    if (onVoiceAuthResult) {
      socket.on('voiceAuthResult', onVoiceAuthResult);
    }
    if (onChatMessage) {
      socket.on('chatMessage', onChatMessage);
    }

    return () => {
      socket.off('participantJoined');
      socket.off('participantLeft');
      socket.off('meetingStateUpdate');
      socket.off('voiceAuthRequired');
      socket.off('voiceAuthResult');
      socket.off('chatMessage');
    };
  }, [
    socket,
    onParticipantJoined,
    onParticipantLeft,
    onMeetingStateUpdate,
    onVoiceAuthRequired,
    onVoiceAuthResult,
    onChatMessage,
  ]);

  // Helper functions for meeting actions
  const sendMessage = useCallback(
    (message: string) => {
      if (socket && isConnected) {
        socket.emit('sendMessage', { meetingId, message });
      }
    },
    [socket, isConnected, meetingId]
  );

  const submitVoiceAuth = useCallback(
    (voiceSample: Float32Array) => {
      if (socket && isConnected) {
        socket.emit('submitVoiceAuth', { meetingId, userId, voiceSample });
      }
    },
    [socket, isConnected, meetingId, userId]
  );

  const leaveMeeting = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('leaveMeeting', { meetingId, userId });
    }
  }, [socket, isConnected, meetingId, userId]);

  return {
    socket,
    isConnected,
    error,
    sendMessage,
    submitVoiceAuth,
    leaveMeeting,
  };
} 