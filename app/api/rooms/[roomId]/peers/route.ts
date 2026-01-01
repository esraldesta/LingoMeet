import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Simple in-memory store for peer IDs with user info (in production, use Redis or database)
interface PeerInfo {
  peerId: string;
  userId: string;
  userName: string;
  userEmail: string;
}

const peerStore = new Map<string, Map<string, PeerInfo>>();

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const peersMap = peerStore.get(params.roomId) || new Map();
    const peers = Array.from(peersMap.values());
    return NextResponse.json({ peers });
  } catch (error) {
    console.error("Error fetching peers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { peerId } = body;

    if (!peerId) {
      return NextResponse.json({ error: "Peer ID is required" }, { status: 400 });
    }

    if (!peerStore.has(params.roomId)) {
      peerStore.set(params.roomId, new Map());
    }

    const peerInfo: PeerInfo = {
      peerId,
      userId: session.user.id,
      userName: session.user.name || session.user.email || "Unknown",
      userEmail: session.user.email || "",
    };

    peerStore.get(params.roomId)!.set(peerId, peerInfo);

    // Clean up old entries periodically (simple cleanup)
    setTimeout(() => {
      peerStore.get(params.roomId)?.delete(peerId);
    }, 5 * 60 * 1000); // Remove after 5 minutes

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error registering peer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { peerId } = body;

    if (peerId) {
      peerStore.get(params.roomId)?.delete(peerId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing peer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
