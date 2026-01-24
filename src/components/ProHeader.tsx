"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Shield, LayoutDashboard, Users, Calendar, CalendarDays, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function ProHeader() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-background border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/pro/dashboard" className="text-2xl font-bold text-primary">
          LingoMeet Pro
        </Link>

        <div className="flex items-center gap-2 md:gap-4">

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link href="/pro/dashboard" className="flex items-center gap-1 hover:text-white/80 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/pro/sessions" className="flex items-center gap-1 hover:text-white/80 transition-colors">
                <CalendarDays className="w-4 h-4" /> Sessions
              </Link>
              <Link href="/pro/profile" className="flex items-center gap-1 hover:text-white/80 transition-colors">
                <User className="w-4 h-4" /> Profile
              </Link>
            </div>

          </div>
          <div className="flex items-center gap-2 pl-2 border-l ml-2">
            {session && (
              <>
                <span className="text-sm text-muted-foreground hidden lg:inline-block max-w-[150px] truncate">
                  {session.user.name || session.user.email}
                </span>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            )}

            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
