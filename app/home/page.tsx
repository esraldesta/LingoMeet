"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, Video, GraduationCap, Calendar, Loader, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import CreateRoomDialog from "./_components/CreateRoomDialog";
import { RoomWithParticipantCount } from "@/types/room";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<RoomWithParticipantCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const {
    data: session,
    isPending,
  } = authClient.useSession();

  const fetchRooms = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (page > 1) params.set("page", String(page));
    const response = await fetch(`/api/rooms?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      setRooms(data.rooms ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? 0);
    }
  }, [q, page]);

  useEffect(() => {
    if (!session) {
      if (!isPending) setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchRooms().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [session, isPending, fetchRooms]);

  const setSearchUrl = (newQ: string, newPage: number = 1) => {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set("q", newQ.trim());
    if (newPage > 1) params.set("page", String(newPage));
    const query = params.toString();
    router.push(query ? `/home?${query}` : "/home");
  };

  const [searchInput, setSearchInput] = useState(q);
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchUrl(searchInput, 1);
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchUrl(q, newPage);
  };



  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    )
  }

  // Filter for actual upcoming sessions only for the sidebar
//   const now = new Date();
//   const upcomingBookings = bookings.filter(b => {
//       const endDate = new Date(b.endTime);
//       return endDate > now && b.status !== 'completed' && b.status !== 'canceled';
//   }).slice(0, 3); // Show max 3


  return (


      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-3xl font-bold">Your Rooms</h2>
              <div className="flex flex-wrap items-center gap-2">
                <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 sm:flex-initial min-w-0">
                  <div className="relative flex-1 min-w-[140px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search rooms..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-8"
                      aria-label="Search rooms"
                    />
                  </div>
                  <Button type="submit" variant="secondary" size="default">
                    Search
                  </Button>
                </form>
                <CreateRoomDialog
                  onSuccess={() => {
                    fetchRooms();
                  }}
                />
              </div>
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

            {!loading && rooms.length < 1 && (
              <div className="text-center py-12">
                <p className="mb-4">
                  {q ? "No rooms match your search. Try different keywords." : "No rooms yet. Create the first room!"}
                </p>
                {q && (
                  <Button variant="outline" onClick={() => setSearchUrl("", 1)}>
                    Clear search
                  </Button>
                )}
              </div>
            )}

            {!loading && rooms.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {page} of {totalPages}
                  {total > 0 && ` (${total} room${total !== 1 ? "s" : ""})`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
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
              
              {/* {upcomingBookings.length > 0 ? (
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
                              <Link href="/home/sessions" className="text-xs text-blue-500 hover:underline">
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
              )} */}
            </div>
          </div>
        </div>
      </div>

  );
}
