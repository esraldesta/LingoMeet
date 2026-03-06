export const dynamic = "force-dynamic";

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ActiveRoom {
  roomId: string;
  name: string;
  language: string;
}

export default function AlreadyConnectedPage() {
  const [activeRoom, setActiveRoom] = useState<ActiveRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");
  const isPro = type === "pro";
  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await fetch("/api/rooms/active");
        const data = await res.json();

        if (data.active === null) {
          router.push(isPro ? "/pro/sessions" : "/home");
          return;
        }

        setActiveRoom(data);
      } catch (err) {
        console.error("Failed to fetch active room", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActive();
  }, [router]);

  const handleLeave = async () => {
    setLeaving(true);

    try {
      await fetch("/api/rooms/leave-active", {
        method: "POST",
      });
      router.push(isPro ? "/pro/sessions" : "/home");
    } catch (err) {
      console.error("Failed to leave room", err);
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Checking active session...
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-secondary p-8 rounded-xl shadow-lg text-center space-y-6">
        <h1 className="text-2xl font-semibold">
          You're already in another room
        </h1>

        {activeRoom && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Room:</strong> {activeRoom.name}</p>
            <p><strong>Language:</strong> {activeRoom.language}</p>
          </div>
        )}

        <button
          onClick={handleLeave}
          disabled={leaving}
          className="w-full py-3 rounded-lg bg-destructive hover:bg-destructive/80 text-white font-medium transition-colors disabled:opacity-50"
        >
          {leaving ? "Leaving..." : "Leave Other Room"}
        </button>

        <button
          onClick={() => router.push("/home")}
          className="w-full py-3 rounded-lg bg-primary text-secondary hover:bg-primary/80 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}