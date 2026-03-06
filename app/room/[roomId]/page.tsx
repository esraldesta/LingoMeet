"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { CheckCircle2, XCircle } from "lucide-react";
import { VideoRoom } from "../_components/video-room";
import { RoomDetailResponse } from "@/types/room";
import { RoomStatus, RoomType } from "@/generated/prisma/enums";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const [room, setRoom] = useState<RoomDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth/signin");
    }
  }, [isPending, session, router]);

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


  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading room...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error || "Room not found"}</div>
          <button
            onClick={() => router.push("/home")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

    if (room.roomType === RoomType.PRIVATE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error || "Room not found"}</div>
          <button
            onClick={() => router.push("/home")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Check if room is completed or canceled
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
          <div className="text-white text-2xl font-semibold mb-2 capitalize">Session {room.status}</div>
          <div className="text-gray-400 mb-6">
            This session has ended and is no longer accessible.
          </div>
          <button
            onClick={() => router.push("/home")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Check if room is full (but allow access if user is already a participant)
  const isFull = room.isFull || (room.participantCount !== undefined && room.participantCount >= room.maxParticipants);
  if (isFull && !room.isParticipant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl font-semibold mb-2">Room is Full</div>
          <div className="text-gray-400 mb-6">
            This room has reached its maximum capacity of {room.maxParticipants} participants.
          </div>
          <button
            onClick={() => router.push("/home")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return <VideoRoom room={room} />;
}
