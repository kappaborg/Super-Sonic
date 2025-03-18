import {
    disconnectSocket,
    getSocket,
    initSocketClient,
    joinMeeting,
    leaveMeeting,
    sendMessage,
    submitVoiceAuth,
    useSocketListener,
} from '@/lib/websocket/client';
import { Socket } from 'socket.io-client';

import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from '@/lib/websocket/server';

export {
    disconnectSocket, getSocket,
    initSocketClient, joinMeeting,
    leaveMeeting, sendMessage, Socket, submitVoiceAuth, useSocketListener
};

    export type {
        ClientToServerEvents,
        ServerToClientEvents
    };
