"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoRoom } from "@/components/video-room";
import { authClient } from "@/lib/auth-client";
import { CheckCircle2, XCircle } from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


   const {
    data: session,
    isPending, //loading state
  } = authClient.useSession()

  if(!session && !isPending){
    router.push("/auth/signin")
  }

  useEffect(() => {
    const fetchRoom = async () => {
      try {


        // In Next.js 15, params can be a Promise, but useParams() returns sync object
        const roomId = params.roomId as string;
        if (!roomId) {
          setError("Room ID is required");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/rooms/${roomId}`);
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

    fetchRoom();
  }, [params, router]);

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
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check if room is completed or canceled
  if (room.status === 'completed' || room.status === 'canceled') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <div className="flex justify-center mb-4">
                {room.status === 'completed' ? (
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
      <div className="min-h-screen flex items-center justify-center">
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
