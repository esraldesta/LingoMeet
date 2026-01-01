import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

    // Check if room exists and get current participant count
    const room = await prisma.room.findUnique({
      where: { id: params.roomId },
      include: {
        participants: {
          where: {
            leftAt: null,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.roomParticipant.findFirst({
      where: {
        roomId: params.roomId,
        userId: session.user.id,
        leftAt: null,
      },
    });

    // If not already a participant, check if room is full
    if (!existingParticipant) {
      const participantCount = room.participants.length;
      if (participantCount >= room.maxParticipants) {
        return NextResponse.json({ error: "Room is full" }, { status: 403 });
      }

      let role = "participant";

      // Add user as participant
      if(room.createdBy === session.user.id){
        role = "host";
      }

      await prisma.roomParticipant.create({
        data: {
          roomId: params.roomId,
          userId: session.user.id,
          role
        },
      });
    }

    // Store peer ID (you might want to add a peerId field to room_participants table)
    // For now, we'll just return success
    return NextResponse.json({ success: true, peerId });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
