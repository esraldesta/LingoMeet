"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Video, LogOut, GraduationCap, Calendar, Star, Shield, Loader } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "@/components/theme-toggle";
import CreateRoomDialog from "@/components/CreateRoomDialog";

interface Room {
  id: string;
  name: string;
  description: string | null;
  language: string;
  topic: string | null;
  roomType: string;
  isPublic: boolean;
  maxParticipants: number;
  createdBy: string;
  status: string;
  participantCount?: number;
  isFull?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch //refetch the session
  } = authClient.useSession()

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchRooms();
  }, [session]);


  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    )
  }


  return (
    <div className="min-h-screen">
      <nav className="bg-secondary shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Talk</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
            <span>
              {session?.user?.name || session?.user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <ModeToggle />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Your Rooms</h2>


              <CreateRoomDialog
                onSuccess={() => {
                  fetchRooms();
                }}
              />
            </div>

            {
              loading ?
                <div className="w-full flex items-center justify-center">
                  <div className="text-xl">Loading...</div>
                </div> :

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {
                    rooms.length > 0 &&
                    rooms.map((room) => (
                      <div
                        key={room.id}
                        className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">
                              {room.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {room.description || "No description"}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Video className="w-4 h-4" />
                                {room.language}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {room.participantCount || 0}/{room.maxParticipants}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {room.participantCount !== undefined && room.participantCount >= room.maxParticipants ? (
                          // {true ? (
                            <button
                              disabled
                              className="flex-1 text-center px-4 py-2 bg-accent text-accent-foreground/60 rounded-lg cursor-not-allowed"
                            >
                              Room Full
                            </button>
                          ) : (
                            <Link
                              href={`/room/${room.id}`}
                              className="flex-1 text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/60 transition-colors"
                            >
                              Join Room
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
            }

            {
              !loading && rooms.length < 1 &&
              <div className="text-center py-12">
                <p className="mb-4">No rooms yet. Create the first room!</p>
              </div>
            }
          </div>

          <div className="lg:col-span-1">
            <div className="bg-secondary rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Professional Sessions
              </h3>
              <p className="text-muted-foreground b-4 my-2">
                Get personalized guidance from verified language professionals
              </p>
              <div className="space-y-3">
                <Link
                  href="/professionals"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Browse Professionals
                </Link>
                <Link
                  href="/book-session"
                  className="block w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors text-center"
                >
                  Book Session
                </Link>
                <Link
                  href="/professional-signup"
                  className="block w-full px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-colors text-center"
                >
                  Become a Professional
                </Link>
                <Link
                  href="/professional-dashboard"
                  className="block w-full px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors text-center"
                >
                  Professional Dashboard
                </Link>
              </div>
            </div>

            <div className="bg-secondary rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Sessions
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No upcoming professional sessions booked
              </p>
              <Link
                href="/professionals"
                className="text-blue-600 hover:underline text-sm"
              >
                Find a professional →
              </Link>
            </div>
          </div>
        </div>


      </div>



    </div>
  );
}
