import { query } from '@/lib/db';
import { ApiError, ApiErrorCode } from '@/lib/errors';
import { MeetingMessage } from '@/types/api';
import { Server as NetServer } from 'http';
import { Server as SocketServer } from 'socket.io';

export interface ServerToClientEvents {
  // Meeting events
  meetingStateUpdate: (data: {
    meetingId: string;
    status: string;
    participants: any[];
  }) => void;
  participantJoined: (data: {
    meetingId: string;
    userId: string;
    name: string;
  }) => void;
  participantLeft: (data: {
    meetingId: string;
    userId: string;
  }) => void;
  voiceAuthRequired: (data: {
    meetingId: string;
    userId: string;
  }) => void;
  voiceAuthResult: (data: {
    meetingId: string;
    userId: string;
    success: boolean;
    message?: string;
  }) => void;
  
  // Chat events
  chatMessage: (data: {
    meetingId: string;
    userId: string;
    name: string;
    message: string;
    timestamp: number;
  }) => void;
  
  // Error events
  error: (error: {
    code: string;
    message: string;
  }) => void;

  // Connection events
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;

  // Meeting events
  userJoined: (data: { meetingId: string; userId: string; name: string }) => void;
  userLeft: (data: { meetingId: string; userId: string }) => void;
  messageReceived: (message: MeetingMessage) => void;
}

export interface ClientToServerEvents {
  // Meeting events
  joinMeeting: (data: {
    meetingId: string;
    userId: string;
    name: string;
  }) => void;
  leaveMeeting: (data: {
    meetingId: string;
    userId: string;
  }) => void;
  submitVoiceAuth: (data: {
    meetingId: string;
    userId: string;
    voiceSample: Float32Array;
  }) => void;
  
  // Chat events
  sendMessage: (data: {
    meetingId: string;
    message: string;
  }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  meetingId?: string;
}

let io: SocketServer | null = null;

export function getSocketIO(): SocketServer {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
}

export function initSocketIO(server: NetServer): SocketServer {
  if (!io) {
    io = new SocketServer<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(server, {
      path: '/api/ws',
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        skipMiddlewares: true,
      },
    });

    // Middleware for authentication
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new ApiError(
            ApiErrorCode.UNAUTHORIZED,
            'Authentication required',
            401
          );
        }

        // Verify token and get user info
        // Replace this with your auth logic
        const userId = 'user_id_from_token';
        socket.data.userId = userId;

        next();
      } catch (error) {
        next(error instanceof ApiError ? error : new Error('Authentication failed'));
      }
    });

    // Handle connection
    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join meeting
      socket.on('joinMeeting', async (data) => {
        try {
          const { meetingId, userId, name } = data;

          // Verify meeting access
          const meeting = await query<any[]>(
            'SELECT * FROM meetings WHERE id = $1',
            [meetingId]
          );

          if (!meeting[0]) {
            throw new ApiError(
              ApiErrorCode.MEETING_NOT_FOUND,
              'Meeting not found',
              404
            );
          }

          // Join socket room
          socket.join(meetingId);
          socket.data.meetingId = meetingId;

          // Update meeting participants
          await query(
            `UPDATE meeting_participants 
             SET joined_at = NOW() 
             WHERE meeting_id = $1 AND user_id = $2`,
            [meetingId, userId]
          );

          // Notify others
          socket.to(meetingId).emit('participantJoined', {
            meetingId,
            userId,
            name,
          });

          // Send current meeting state
          const participants = await query<any[]>(
            `SELECT mp.*, p.name, p.avatar_url
             FROM meeting_participants mp
             JOIN profiles p ON p.user_id = mp.user_id
             WHERE mp.meeting_id = $1`,
            [meetingId]
          );

          socket.emit('meetingStateUpdate', {
            meetingId,
            status: meeting[0].status,
            participants,
          });
        } catch (error) {
          handleSocketError(socket, error);
        }
      });

      // Leave meeting
      socket.on('leaveMeeting', async (data) => {
        try {
          const { meetingId, userId } = data;
          
          // Update participant status
          await query(
            `UPDATE meeting_participants 
             SET left_at = NOW() 
             WHERE meeting_id = $1 AND user_id = $2`,
            [meetingId, userId]
          );

          // Leave socket room
          socket.leave(meetingId);
          socket.data.meetingId = undefined;

          // Notify others
          socket.to(meetingId).emit('participantLeft', {
            meetingId,
            userId,
          });
        } catch (error) {
          handleSocketError(socket, error);
        }
      });

      // Handle voice authentication
      socket.on('submitVoiceAuth', async (data) => {
        try {
          const { meetingId, userId, voiceSample } = data;

          // Process voice authentication
          // This is a placeholder - implement your voice auth logic
          const authResult = await processVoiceAuth(userId, voiceSample);

          // Update participant status
          await query(
            `UPDATE meeting_participants 
             SET voice_auth_status = $1 
             WHERE meeting_id = $2 AND user_id = $3`,
            [authResult.success ? 'success' : 'failed', meetingId, userId]
          );

          // Notify client
          socket.emit('voiceAuthResult', {
            meetingId,
            userId,
            success: authResult.success,
            message: authResult.message,
          });
        } catch (error) {
          handleSocketError(socket, error);
        }
      });

      // Handle chat messages
      socket.on('sendMessage', async (data) => {
        try {
          const { meetingId, message } = data;
          const userId = socket.data.userId;

          // Get user profile
          const profile = await query<any[]>(
            'SELECT name FROM profiles WHERE user_id = $1',
            [userId]
          );

          // Broadcast message to meeting participants
          io?.to(meetingId).emit('chatMessage', {
            meetingId,
            userId,
            name: profile[0].name,
            message,
            timestamp: Date.now(),
          });
        } catch (error) {
          handleSocketError(socket, error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        try {
          console.log(`Client disconnected: ${socket.id}`);
          
          if (socket.data.meetingId && socket.data.userId) {
            // Update participant status
            await query(
              `UPDATE meeting_participants 
               SET left_at = NOW() 
               WHERE meeting_id = $1 AND user_id = $2`,
              [socket.data.meetingId, socket.data.userId]
            );

            // Notify others
            socket.to(socket.data.meetingId).emit('participantLeft', {
              meetingId: socket.data.meetingId,
              userId: socket.data.userId,
            });
          }
        } catch (error) {
          console.error('Disconnect error:', error);
        }
      });
    });
  }
  return io;
}

// Helper function to handle socket errors
function handleSocketError(socket: any, error: unknown) {
  console.error('Socket error:', error);
  
  const errorResponse = {
    code: error instanceof ApiError ? error.code : ApiErrorCode.UNKNOWN_ERROR,
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  };

  socket.emit('error', errorResponse);
}

// Placeholder for voice authentication processing
async function processVoiceAuth(userId: string, voiceSample: Float32Array) {
  try {
    // Get user's voice print
    const voicePrints = await query<any[]>(
      'SELECT voice_features FROM voice_prints WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    if (!voicePrints.length) {
      return {
        success: false,
        message: 'No voice print found. Please enroll first.',
      };
    }

    // TODO: Implement actual voice authentication logic
    // This is just a placeholder
    const success = Math.random() > 0.5;

    // Log authentication attempt
    await query(
      `INSERT INTO voice_auth_attempts (
        user_id, success, confidence_score
      ) VALUES ($1, $2, $3)`,
      [userId, success, success ? 0.85 : 0.45]
    );

    return {
      success,
      message: success ? 'Voice authentication successful' : 'Voice authentication failed',
    };
  } catch (error) {
    console.error('Voice auth processing error:', error);
    throw new ApiError(
      ApiErrorCode.VOICE_PROCESSING_ERROR,
      'Failed to process voice authentication',
      500
    );
  }
} 