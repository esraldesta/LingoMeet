"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";
import {
  Video,
  Users,
  Calendar,
  Globe,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Laptop
} from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";

export default function LandingPage() {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-secondary/20 to-background">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                New: Professional Tutors Added 🚀
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                Master a New Language with <br className="hidden md:block" />
                <span className="text-primary">Native Speakers</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with language learners globally in free peer-to-peer video rooms or book 1-on-1 sessions with verified professionals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="h-12 px-8 text-lg" asChild>
                  <Link href={session ? "/dashboard" : "/auth/signup"}>
                    {session ? "Go to Dashboard" : "Get Started for Free"}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg" asChild>
                  <Link href="/professionals">
                    Browse Professionals
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Abstract Background Shapes */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 blur-3xl rounded-full bg-primary pointer-events-none" />
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose LingoMeet?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We combine the best of both worlds: community-driven practice and professional guidance.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Users className="w-10 h-10 text-blue-500" />}
                title="Community Rooms"
                description="Join public voice and video rooms to practice conversation with peers for free."
              />
              <FeatureCard 
                icon={<Award className="w-10 h-10 text-purple-500" />}
                title="Expert Tutors"
                description="Book private 1-on-1 sessions with verified language professionals to accelerate your learning."
              />
              <FeatureCard 
                icon={<Video className="w-10 h-10 text-green-500" />}
                title="Seamless Video"
                description="High-quality WebRTC video and audio built directly into the browser. No downloads needed."
              />
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
             <div className="grid md:grid-cols-2 gap-12 items-center">
               <div className="space-y-8">
                 <h2 className="text-3xl font-bold">How LingoMeet Works</h2>
                 
                 <div className="space-y-6">
                   <Step 
                     number="1" 
                     title="Create your account" 
                     description="Sign up in seconds. Choose your target language and current proficiency level."
                   />
                   <Step 
                     number="2" 
                     title="Choose your path" 
                     description="Join a free community room to chat or browse our marketplace for professional tutors."
                   />
                   <Step 
                     number="3" 
                     title="Start Speaking" 
                     description="Jump into a video call immediately or schedule a session for later. Practice makes perfect!"
                   />
                 </div>
               </div>
               
               <div className="relative h-[400px] bg-secondary/30 rounded-2xl border flex items-center justify-center overflow-hidden p-8">
                  {/* Abstract Representation of UI */}
                  <div className="w-full max-w-sm bg-card rounded-lg shadow-xl border p-4 space-y-4">
                     <div className="flex items-center gap-3 border-b pb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20" />
                        <div className="space-y-2 flex-1">
                           <div className="h-4 w-1/2 bg-secondary rounded" />
                           <div className="h-3 w-1/3 bg-secondary rounded" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="h-20 w-full bg-secondary/50 rounded" />
                        <div className="flex gap-2">
                           <div className="h-10 flex-1 bg-primary rounded" />
                           <div className="h-10 flex-1 bg-secondary rounded" />
                        </div>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to become fluent?</h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of learners and start speaking your target language with confidence today.
            </p>
            <Button size="lg" variant="secondary" className="h-12 px-8 text-lg text-primary" asChild>
              <Link href="/auth/signup">
                Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-muted border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg">LingoMeet</h3>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} LingoMeet. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
            <Link href="#" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-background p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
