import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, LayoutDashboard, LogOut, CalendarDays, User } from "lucide-react";
import ProHeader from "@/components/ProHeader";


export default async function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ProHeader />
      <main className="flex-1 bg-muted/10">
        {children}
      </main>
    </div>
  );
}
