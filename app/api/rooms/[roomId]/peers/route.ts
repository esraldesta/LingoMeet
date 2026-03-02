import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { RoomStatus } from "@/generated/prisma/enums";

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

    // Fetch room with active participants
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        participants: {
          where: { leftAt: null },
          select: {
            userId: true,
            peerId: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
                // optionally:
                // username: true,
                // image: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status === RoomStatus.COMPLETED || room.status === RoomStatus.CANCELED) {
      return NextResponse.json({ error: "Session has ended" }, { status: 403 });
    }

    return NextResponse.json({
      roomId: room.id,
      participants: room.participants.map(p => ({
        userId: p.userId,
        peerId: p.peerId,
        role: p.role,
        name: p.user?.name || p.user.email,
      })),
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}