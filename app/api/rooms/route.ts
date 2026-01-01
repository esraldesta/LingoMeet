import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rooms = await prisma.room.findMany({
      where: {
        status: "active",
        OR: [
          { isPublic: true },
          { createdBy: session.user.id },
        ],
      },
      include: {
        participants: {
          where: {
            leftAt: null,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const roomsWithCount = rooms.map((room) => ({
      ...room,
      participant_count: room.participants.length,
      isFull: room.participants.length >= room.maxParticipants,
    }));

    return NextResponse.json(roomsWithCount);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, language, topic, room_type, is_public, max_participants } = body;

    if (!name || !language) {
      return NextResponse.json({ error: "Name and language are required" }, { status: 400 });
    }

    const room = await prisma.room.create({
      data: {
        name,
        description: description || null,
        language,
        topic: topic || null,
        roomType: room_type || "general",
        isPublic: is_public !== false,
        maxParticipants: max_participants || 10,
        createdBy: session.user.id,
      },
    });


    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
