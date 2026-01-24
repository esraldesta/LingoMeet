"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Shield, LayoutDashboard, Users, Calendar } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-background border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-primary">
          LingoMeet
        </Link>
        
        <div className="flex items-center gap-2 md:gap-4">

          <div className="flex items-center gap-2 pl-2 border-l ml-2">
            {session ? (
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
            ) : (
                <div className="flex gap-2">
                    <Button variant="ghost" asChild size="sm">
                        <Link href="/auth/signin">Sign In</Link>
                    </Button>
                    <Button asChild size="sm">
                         <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                </div>
            )}
            
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
