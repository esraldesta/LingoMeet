import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.roomParticipant.updateMany({
    where: {
      userId: session.user.id,
      leftAt: null,
    },
    data: {
      leftAt: new Date(),
      peerId: null,
    },
  });

  return NextResponse.json({ success: true });
}