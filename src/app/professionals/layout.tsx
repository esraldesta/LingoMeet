import { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Language Professionals | LingoMeet",
  description: "Find expert language tutors for 1-on-1 sessions.",
};

export default function ProfessionalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
