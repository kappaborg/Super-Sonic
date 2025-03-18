import { initSocketIO } from '@/lib/websocket/server';
import { createServer } from 'http';
import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';

// This is a workaround for WebSockets in Next.js App Router
// WebSockets are not directly supported yet, so we need to use an edge function approach

// Create HTTP server instance
const httpServer = createServer();

// Initialize Socket.IO with the HTTP server
const io = initSocketIO(httpServer);

// Create a WebSocket server
const wss = new WebSocketServer({ noServer: true });

export async function GET(req: NextRequest) {
  // Since we can't directly handle WebSocket upgrades in Next.js App Router yet,
  // we return instructions for the client to connect using a different approach
  
  return new Response(JSON.stringify({
    message: "WebSocket connections should be made directly to the WebSocket server endpoint",
    wsEndpoint: "/api/websocket"
  }), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export const dynamic = 'force-dynamic'; 