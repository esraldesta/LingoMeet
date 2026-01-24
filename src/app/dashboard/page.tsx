"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Video, LogOut, GraduationCap, Calendar, Star, Shield, Loader, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "@/components/theme-toggle";
import CreateRoomDialog from "@/components/CreateRoomDialog";
import { getUserBookings } from "@/app/actions/booking";
import Header from "@/components/Header";


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

interface Booking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  professional: {
    user: {
      name: string;
      image: string | null;
    }
  };
  room: {
    id: string;
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
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
    }
  };

  const fetchBookings = async () => {
      try {
          const data = await getUserBookings();
          setBookings(data as any); // Casting for simplicity
      } catch (error) {
          console.error("Failed to fetch bookings:", error);
      }
  };

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        await Promise.all([fetchRooms(), fetchBookings()]);
        setLoading(false);
    };
    if (session) {
        init();
    } else if (!isPending) {
         // Maybe redirect?
         setLoading(false);
    }
  }, [session, isPending]);


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

  // Filter for actual upcoming sessions only for the sidebar
  const now = new Date();
  const upcomingBookings = bookings.filter(b => {
      const endDate = new Date(b.endTime);
      return endDate > now && b.status !== 'completed' && b.status !== 'canceled';
  }).slice(0, 3); // Show max 3


  return (
    <div className="min-h-screen">
      <Header />

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

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-secondary rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Professional Sessions
              </h3>
              <p className="text-muted-foreground b-4 my-2 text-sm">
                Get personalized guidance from verified language professionals
              </p>
              <div className="space-y-3">
                <Link
                  href="/professionals"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Browse Professionals
                </Link>


              </div>
            </div>

            <div className="bg-secondary rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Sessions
              </h3>
              
              {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                      {upcomingBookings.map(booking => (
                          <div key={booking.id} className="bg-card p-3 rounded border">
                              <div className="font-semibold text-sm mb-1">
                                  {new Date(booking.startTime).toLocaleDateString()} @ {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                  with {booking.professional.user.name}
                              </div>
                              {booking.room && (
                                  <Link 
                                    href={`/room/${booking.room.id}`}
                                    className="text-xs flex items-center gap-1 text-primary hover:underline"
                                  >
                                      Join Session <ArrowRight className="w-3 h-3" />
                                  </Link>
                              )}
                          </div>
                      ))}
                      
                      {upcomingBookings.length < bookings.filter(b => {
                           const endDate = new Date(b.endTime);
                           return endDate > now && b.status !== 'completed' && b.status !== 'canceled';
                      }).length && (
                          <div className="text-center pt-2">
                              <Link href="/dashboard/sessions" className="text-xs text-blue-500 hover:underline">
                                  View all upcoming
                              </Link>
                          </div>
                      )}
                  </div>
              ) : (
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                        No upcoming professional sessions booked
                    </p>
                    <Link
                        href="/professionals"
                        className="text-blue-600 hover:underline text-sm"
                    >
                        Find a professional →
                    </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
