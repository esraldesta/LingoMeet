"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProSignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        // Redirect logic handled in onSuccess
      }, {
        onSuccess: () => {
             // We redirect to /pro which handles routing to dashboard or status
             router.push("/pro");
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Invalid credentials");
          setLoading(false);
        }
      });
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <div className="bg-card p-8 rounded-lg shadow-xl w-full max-w-md border">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">Professional Login</h1>
            <p className="text-muted-foreground mt-2">
                Access your teacher dashboard
            </p>
        </div>

        {error && (
          <div className="border border-destructive text-destructive px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
             <Label htmlFor="password">Password</Label>
             <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-4">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p>
            Don't have a professional account?{" "}
            <Link href="/auth/pro-signup" className="underline hover:text-primary">
              Apply now
            </Link>
          </p>
          <p className="mt-2 text-muted-foreground">
             <Link href="/auth/signin" className="hover:underline">
                 Looking for Learner Login?
             </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
