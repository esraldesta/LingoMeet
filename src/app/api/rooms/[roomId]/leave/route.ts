import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma  from "@/lib/db";

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
    // Mark participant as left
    await prisma.roomParticipant.updateMany({
      where: {
        roomId: roomId,
        userId: session.user.id,
        leftAt: null,
      },
      data: {
        leftAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving room:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
