"use client";

import { useEffect, useState } from "react";
import { getProfessionalBookings } from "@/app/actions/booking";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Video, 
  User as UserIcon, 
  Mail, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Booking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  learner: {
    name: string;
    image: string | null;
    email: string;
  };
  room: {
    id: string;
  } | null;
}

export default function ProSessionsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await getProfessionalBookings();
        setBookings(data as any);
      } catch (error) {
        console.error("Failed to load sessions", error);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const now = new Date();
  
  // Upcoming includes future starts AND currently active sessions
  // Also exclude canceled/completed ones from "Upcoming" logic generally, unless we want to show them differently
  const upcomingSessions = bookings.filter(b => {
      const endDate = new Date(b.endTime);
      return endDate > now && b.status !== 'completed' && b.status !== 'canceled';
  });

  const pastSessions = bookings.filter(b => {
      const endDate = new Date(b.endTime);
      return endDate <= now || b.status === 'completed' || b.status === 'canceled';
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold mb-2">My Sessions</h1>
           <p className="text-muted-foreground">Manage your upcoming classes and view history.</p>
        </div>
      </div>

      <div className="space-y-10">
        {/* Upcoming Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <div className="h-8 w-1 bg-primary rounded-full"></div>
             <h2 className="text-xl font-semibold">Upcoming & Active Sessions ({upcomingSessions.length})</h2>
          </div>
          
          {upcomingSessions.length > 0 ? (
            <div className="grid gap-4">
              {upcomingSessions.map((booking) => (
                <SessionCard key={booking.id} booking={booking} isUpcoming={true} />
              ))}
            </div>
          ) : (
             <div className="bg-card border rounded-lg p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">No upcoming sessions</h3>
                <p className="text-muted-foreground">You don't have any scheduled sessions coming up.</p>
             </div>
          )}
        </section>

        {/* Past Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <div className="h-8 w-1 bg-muted-foreground/30 rounded-full"></div>
             <h2 className="text-xl font-semibold text-muted-foreground">Past History</h2>
          </div>

          {pastSessions.length > 0 ? (
             <div className="grid gap-4 opacity-80 hover:opacity-100 transition-opacity">
               {pastSessions.map((booking) => (
                 <SessionCard key={booking.id} booking={booking} isUpcoming={false} />
               ))}
             </div>
          ) : (
            <p className="text-muted-foreground italic">No session history yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function SessionCard({ booking, isUpcoming }: { booking: Booking, isUpcoming: boolean }) {
    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);
    
    // Check if session is "active" (within 10 mins before start until end)
    const now = new Date();
    // Use isUpcoming prop to ensure it's in the right list context, but verify time for join button
    const isJoinable = isUpcoming && 
                       (now.getTime() >= startDate.getTime() - 10 * 60 * 1000) && 
                       (now.getTime() <= endDate.getTime()) &&
                       booking.status !== 'completed' &&
                       booking.status !== 'canceled';

    const getStatusLabel = () => {
        if (booking.status === 'completed') return 'Completed';
        if (booking.status === 'canceled') return 'Canceled';
        if (now > endDate) return 'Ended';
        return 'Completed'; // Default fallback
    };

    return (
        <div className="bg-card rounded-lg border shadow-sm p-5 flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Date/Time Column */}
            <div className="flex flex-col items-center justify-center min-w-[100px] bg-secondary/50 rounded-lg p-3 text-center border">
                <span className="text-xs font-bold uppercase text-muted-foreground">
                    {startDate.toLocaleDateString(undefined, { month: 'short' })}
                </span>
                <span className="text-2xl font-bold">
                    {startDate.getDate()}
                </span>
                <span className="text-xs text-muted-foreground">
                    {startDate.toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
            </div>

            {/* Main Info */}
            <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize">
                        {booking.status}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground font-medium">
                        <Clock className="w-4 h-4 mr-1" />
                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                        {booking.learner.image ? (
                            <img src={booking.learner.image} alt={booking.learner.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-5 h-5" />
                        )}
                    </div>
                    <div>
                        <div className="font-semibold">{booking.learner.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                             <Mail className="w-3 h-3" /> {booking.learner.email}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
                 {isJoinable ? (
                     <Link href={`/pro/room/${booking.room?.id}`} className="w-full md:w-auto">
                        <Button className="w-full md:w-auto animate-pulse">
                            <Video className="w-4 h-4 mr-2" /> Join Session
                        </Button>
                     </Link>
                 ) : isUpcoming ? (
                     <Button variant="outline" className="w-full md:w-auto" disabled>
                         <Clock className="w-4 h-4 mr-2" /> Starts in {formatTimeUntil(startDate)}
                     </Button>
                 ) : (
                     <Button variant="ghost" className="w-full md:w-auto" disabled>
                         {getStatusLabel()}
                     </Button>
                 )}
                 
                 {isUpcoming && booking.status !== 'completed' && booking.status !== 'canceled' && (
                     <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive w-full md:w-auto">
                         Cancel
                     </Button>
                 )}
            </div>
        </div>
    );
}

function formatTimeUntil(date: Date) {
    const diff = date.getTime() - new Date().getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours} hours`;
    return "soon";
}
