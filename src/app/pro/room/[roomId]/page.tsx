"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoRoom } from "@/components/video-room";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { completeSession } from "@/app/actions/booking";
import { toast } from "sonner";

export default function ProRoomPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false);

  const {
    data: session,
    isPending,
  } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
        router.push("/auth/pro-signin");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomId = params.roomId as string;
        if (!roomId) {
          setError("Room ID is required");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/rooms/${roomId}`);
        if (response.ok) {
          const data = await response.json();
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

    if (session) {
        fetchRoom();
    }
  }, [params, session]);

  const handleEndSession = async () => {
      if (!confirm("Are you sure you want to end this session? This will complete the booking.")) {
          return;
      }
      
      setCompleting(true);
      try {
          await completeSession(room.id);
          toast.success("Session completed successfully");
          router.push("/pro/sessions");
      } catch (error) {
          console.error(error);
          toast.error("Failed to end session");
          setCompleting(false);
      }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl flex items-center gap-2">
            <Loader2 className="animate-spin w-5 h-5" /> Loading room...
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-xl mb-4 text-destructive">{error || "Room not found"}</div>
          <Button onClick={() => router.push("/pro/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  // Custom leave handler
  const handleLeave = () => {
      if (confirm("Leaving without ending the session? You can rejoin later.")) {
          router.push("/pro/dashboard");
      }
  };

  return (
    <VideoRoom 
        room={room} 
        onLeave={handleLeave}
        customControls={
            <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleEndSession} 
                disabled={completing}
                className="bg-red-700 hover:bg-red-800"
            >
                {completing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                End Session
            </Button>
        }
    />
  );
}
