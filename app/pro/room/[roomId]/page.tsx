"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { VideoRoom } from "@/app/room/_components/video-room";
import { RoomDetailResponse } from "@/types/room";
import { RoomStatus } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function ProRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const [room, setRoom] = useState<RoomDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session, isPending } = authClient.useSession();

  /**
   * Redirect if not authenticated
   */
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth/pro-signin");
    }
  }, [isPending, session, router]);

  /**
   * Fetch room
   */
  useEffect(() => {
    if (!session || !roomId) return;

    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);

        if (!response.ok) {
          const errorData: { error?: string } = await response.json();
          throw new Error(errorData.error ?? "Room not found");
        }

        const data: RoomDetailResponse = await response.json();
        setRoom(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load room");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [session, roomId]);

  /**
   * Loading UI
   */
  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-lg">
          <Loader2 className="animate-spin w-5 h-5" />
          Loading room...
        </div>
      </div>
    );
  }

  /**
   * Error UI
   */
  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">{error || "Room not found"}</div>

          <Button onClick={() => router.push("/pro")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  /**
   * Session already completed / canceled
   */
  if (room.status === RoomStatus.COMPLETED || room.status === RoomStatus.CANCELED) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">

          <div className="flex justify-center mb-4">
            {room.status === RoomStatus.COMPLETED ? (
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>

          <div className="text-2xl font-semibold mb-2 capitalize">
            Session {room.status}
          </div>

          <div className="text-muted-foreground mb-6">
            This session has ended.
          </div>

          <Button onClick={() => router.push("/pro/sessions")}>
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <VideoRoom
      room={room}
      isPro={session?.user.role === "pro"}
    />
  );
}