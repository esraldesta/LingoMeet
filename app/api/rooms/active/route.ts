import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const active = await prisma.roomParticipant.findFirst({
    where: {
      userId: session.user.id,
      leftAt: null,
    },
    include: {
      room: {
        select: {
          id: true,
          name: true,
          language: true,
        },
      },
    },
  });

  if (!active) {
    return NextResponse.json({ active: null });
  }

  return NextResponse.json({
    roomId: active.room.id,
    name: active.room.name,
    language: active.room.language,
  });
}