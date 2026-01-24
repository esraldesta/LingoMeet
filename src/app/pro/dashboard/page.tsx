"use client";

import { useEffect, useState } from "react";
import { getProfessionalProfile } from "@/app/actions/professional";
import { getProfessionalBookings } from "@/app/actions/booking";
import { Loader2, DollarSign, Star, Calendar, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardStats {
    totalSessions: number;
    upcomingSessions: number;
    rating: number;
    reviews: number;
}

export default function ProfessionalDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [nextSession, setNextSession] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
      totalSessions: 0,
      upcomingSessions: 0,
      rating: 0,
      reviews: 0
  });

  useEffect(() => {
    async function loadData() {
        try {
            const [profData, bookings] = await Promise.all([
                getProfessionalProfile(),
                getProfessionalBookings()
            ]);

            setProfile(profData);
            
            const now = new Date();
            const upcoming = bookings.filter((b: any) => new Date(b.startTime) >= now);
            const next = upcoming.length > 0 ? upcoming[upcoming.length - 1] : null; // Sorted desc, so last is closest? Wait, user bookings are desc. Let's fix that.
            
            // Re-sort upcoming asc for "Next Session"
            upcoming.sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            
            setNextSession(upcoming[0] || null);
            
            setStats({
                totalSessions: bookings.length,
                upcomingSessions: upcoming.length,
                rating: profData?.rating || 0,
                reviews: profData?.reviewCount || 0
            });

        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, []);


  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold">Welcome back!</h1>
           <p className="text-muted-foreground">Here's what's happening with your professional account.</p>
        </div>
        <Link href="/pro/profile">
            <Button variant="outline">Edit Profile</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Sessions" 
            value={stats.totalSessions.toString()} 
            icon={<Calendar className="w-5 h-5 text-blue-500" />} 
          />
           <StatCard 
            title="Rating" 
            value={stats.rating.toFixed(1)} 
            subValue={`(${stats.reviews} reviews)`}
            icon={<Star className="w-5 h-5 text-yellow-500" />} 
          />
           <StatCard 
            title="Next Session" 
            value={stats.upcomingSessions > 0 ? "Upcoming" : "None"} 
            subValue={stats.upcomingSessions > 0 ? `${stats.upcomingSessions} scheduled` : ""}
            icon={<Clock className="w-5 h-5 text-green-500" />} 
          />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Next Session Card */}
              <div className="bg-card rounded-lg border shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Next Up</h3>
                  {nextSession ? (
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-secondary/20 p-4 rounded-lg">
                          <div className="flex gap-4 items-center">
                              <div className="bg-primary/10 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-primary border border-primary/20">
                                   <span className="text-xs font-bold uppercase">{new Date(nextSession.startTime).toLocaleDateString(undefined, {month:'short'})}</span>
                                   <span className="text-lg font-bold leading-none">{new Date(nextSession.startTime).getDate()}</span>
                              </div>
                              <div>
                                  <div className="font-semibold text-lg">{nextSession.learner.name}</div>
                                  <div className="text-muted-foreground text-sm flex items-center gap-2">
                                      <Clock className="w-3 h-3" />
                                      {new Date(nextSession.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(nextSession.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                  </div>
                              </div>
                          </div>
                          <Link href={`/pro/room/${nextSession.room?.id}`}>
                            <Button>Join Session</Button>
                          </Link>
                      </div>
                  ) : (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                          <p>No upcoming sessions scheduled.</p>
                      </div>
                  )}
              </div>

              {/* Quick Actions or Recent Activity could go here */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             <div className="bg-card rounded-lg border shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-2">Profile Status</h3>
                  <div className="flex items-center gap-2 mb-4">
                      <div className={`w-2 h-2 rounded-full ${profile?.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="font-medium">{profile?.isVerified ? "Verified Professional" : "Pending Verification"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                      {profile?.isVerified 
                        ? "Your profile is public and you can accept bookings." 
                        : "Your profile is under review. You cannot accept bookings yet."}
                  </p>
                  <Link href={`/professionals/${profile?.id}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                      View Public Profile <ArrowRight className="w-3 h-3" />
                  </Link>
             </div>
          </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, icon }: { title: string, value: string, subValue?: string, icon: React.ReactNode }) {
    return (
        <div className="bg-card rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                {icon}
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{value}</span>
                {subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
            </div>
        </div>
    );
}
