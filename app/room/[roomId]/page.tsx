"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoRoom } from "@/components/video-room";
import { useAuth } from "@/components/providers/auth-provider";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const auth = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const session = await auth.getSession();
        if (!session?.data?.session) {
          router.push("/auth/signin");
          return;
        }

        const response = await fetch(`/api/rooms/${params.roomId}`);
        if (response.ok) {
          const data = await response.json();
          // Check if current user is already a participant
          // The participants array from API should have userId field
          // We'll check this on the server side instead
          setRoom(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Room not found");
        }
      } catch (err) {
        setError("Failed to load room");
      } finally {
        setLoading(false);
      }
    };

    if (params.roomId) {
      fetchRoom();
    }
  }, [params.roomId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
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
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check if room is full (but allow access if user is already a participant)
  const isFull = room.isFull || (room.participantCount !== undefined && room.participantCount >= room.maxParticipants);
  if (isFull && !room.isParticipant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-white text-2xl font-semibold mb-2">Room is Full</div>
          <div className="text-gray-400 mb-6">
            This room has reached its maximum capacity of {room.maxParticipants} participants.
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <VideoRoom room={room} />;
}
