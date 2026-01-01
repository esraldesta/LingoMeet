import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const participantCount = room.participants.length;
    const isFull = participantCount >= room.maxParticipants;
    
    // Check if current user is already a participant
    const isParticipant = room.participants.some(
      (p) => p.userId === session.user.id
    );

    return NextResponse.json({
      ...room,
      participantCount,
      isFull,
      isParticipant,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
