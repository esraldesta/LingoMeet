import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const room = await prisma.room.findUnique({
      where: { id: roomId },
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

    // Scheduled Session Checks
    if (room.scheduledStartTime) {
        const now = new Date();
        const startTime = new Date(room.scheduledStartTime);
        const timeDiff = startTime.getTime() - now.getTime();
        
        // Allow joining 10 minutes before
        if (timeDiff > 10 * 60 * 1000) {
             return NextResponse.json({ error: "Session has not started yet. Please join 10 minutes before the scheduled time." }, { status: 403 });
        }
        
        // Check authorization for private/scheduled rooms
        if (room.roomType === 'private' || room.teacherId) {
             const isAuthorized = room.createdBy === session.user.id || room.teacherId === session.user.id;
             if (!isAuthorized) {
                 return NextResponse.json({ error: "You are not authorized to join this session." }, { status: 403 });
             }
        }
    }

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
