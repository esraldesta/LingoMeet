import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { RoomStatus, RoomType } from "@/generated/prisma/enums";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
    );

    const baseWhere = {
      status: RoomStatus.ACTIVE,
      roomType: RoomType.GENERAL,
      OR: [
        { isPublic: true },
        { createdBy: session.user.id },
      ],
    };

    const searchWhere = q
      ? {
          AND: [
            baseWhere,
            {
              OR: [
                { name: { contains: q, mode: "insensitive" as const } },
                { description: { contains: q, mode: "insensitive" as const } },
                { language: { contains: q, mode: "insensitive" as const } },
                { topic: { contains: q, mode: "insensitive" as const } },
              ],
            },
          ],
        }
      : baseWhere;

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where: searchWhere,
        include: {
          participants: {
            where: { leftAt: null },
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.room.count({ where: searchWhere }),
    ]);

    const roomsWithCount = rooms.map((room) => ({
      ...room,
      participantCount: room.participants.length,
      isFull: room.participants.length >= room.maxParticipants,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      rooms: roomsWithCount,
      total,
      page,
      limit,
      totalPages,
    });
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
    const { name, description, language, topic, isPublic, maxParticipants } = body;

    if (!name || !language) {
      return NextResponse.json({ error: "Name and language are required" }, { status: 400 });
    }

    const room = await prisma.room.create({
      data: {
        name,
        description: description || null,
        language,
        topic: topic || null,
        roomType: RoomType.GENERAL,
        isPublic: isPublic !== false,
        maxParticipants: maxParticipants || 10,
        createdBy: session.user.id,
      },
    });


    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
