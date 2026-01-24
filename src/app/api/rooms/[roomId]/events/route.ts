import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

interface PeerInfo {
  peerId: string;
  userId: string;
  userName: string;
  userEmail: string;
}

// In-memory store for room connections (in production, use Redis)
const roomConnections = new Map<string, Set<ReadableStreamDefaultController>>();
const roomPeers = new Map<string, Map<string, PeerInfo>>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  
  // Authenticate the user
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the room
      if (!roomConnections.has(roomId)) {
        roomConnections.set(roomId, new Set());
      }
      roomConnections.get(roomId)!.add(controller);

      // Send current peers list
      const peers = roomPeers.get(roomId) || new Map();
      const peersArray = Array.from(peers.values());
      
      controller.enqueue(`data: ${JSON.stringify({
        type: "peers",
        peers: peersArray,
      })}\n\n`);

      // Send keep-alive every 30 seconds
      const keepAlive = setInterval(() => {
        controller.enqueue(`data: ${JSON.stringify({ type: "ping" })}\n\n`);
      }, 30000);

      // Cleanup on disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        roomConnections.get(roomId)?.delete(controller);
        if (roomConnections.get(roomId)?.size === 0) {
          roomConnections.delete(roomId);
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  
  // Authenticate the user
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, peerId } = body;

    if (!roomPeers.has(roomId)) {
      roomPeers.set(roomId, new Map());
    }

    const peers = roomPeers.get(roomId)!;

    switch (type) {
      case "join":
        const peerInfo: PeerInfo = {
          peerId,
          userId: session.user.id,
          userName: session.user.name || session.user.email || "Unknown",
          userEmail: session.user.email || "",
        };

        peers.set(peerId, peerInfo);

        // Broadcast to all connections in the room
        broadcastToRoom(roomId, {
          type: "peer-joined",
          peer: peerInfo,
        });

        console.log(`User ${session.user.name} joined room ${roomId} with peer ${peerId}`);
        break;

      case "leave":
        const peer = peers.get(peerId);
        if (peer) {
          peers.delete(peerId);
          
          // Broadcast to all connections in the room
          broadcastToRoom(roomId, {
            type: "peer-left",
            peerId,
          });

          console.log(`Peer ${peerId} left room ${roomId}`);
        }

        // Clean up if room is empty
        if (peers.size === 0) {
          roomPeers.delete(roomId);
        }
        break;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in room SSE endpoint:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

function broadcastToRoom(roomId: string, message: any) {
  const connections = roomConnections.get(roomId);
  if (!connections) return;

  const messageStr = JSON.stringify(message);
  
  connections.forEach((controller) => {
    try {
      controller.enqueue(`data: ${messageStr}\n\n`);
    } catch (error) {
      // Remove dead connections
      roomConnections.get(roomId)?.delete(controller);
    }
  });
}
