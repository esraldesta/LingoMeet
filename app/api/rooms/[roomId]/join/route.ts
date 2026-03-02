import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { ParticipantRole, RoomStatus } from "@/generated/prisma/enums";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const body = await request.json();
    const { peerId } = body;

    if (!peerId) {
      return NextResponse.json({ error: "Peer ID is required" }, { status: 400 });
    }

    // 🚨 Global active session check
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const activeSession = await prisma.roomParticipant.findFirst({
      where: {
        userId: session.user.id,
        leftAt: null,
        joinedAt: {
          gte: startOfToday,
        },
      },
    });

    if (activeSession) {
      return NextResponse.json(
        {
          error: "You are already connected to another room. Leave it first.",
        },
        { status: 409 }
      );
    }
    // Check if room exists and get current participant count
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        participants: {
          where: { leftAt: null },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status === RoomStatus.COMPLETED || room.status === RoomStatus.CANCELED) {
      return NextResponse.json({ error: "Session has ended" }, { status: 403 });
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.roomParticipant.findFirst({
      where: { roomId, userId: session.user.id, leftAt: null },
    });

    if (existingParticipant) {
      // Update peerId for reconnecting participant
      await prisma.roomParticipant.update({
        where: { id: existingParticipant.id },
        data: { peerId },
      });
    } else {
      // Check if room is full
      if (room.participants.length >= room.maxParticipants) {
        return NextResponse.json({ error: "Room is full" }, { status: 403 });
      }

      // Determine role
      let role = ParticipantRole.PARTICIPANT as ParticipantRole;
      if (room.createdBy === session.user.id) role = ParticipantRole.HOST;

      // Create participant
      await prisma.roomParticipant.create({
        data: {
          roomId,
          userId: session.user.id,
          peerId,
          role,
        },
      });
    }

    return NextResponse.json({ success: true, peerId });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}