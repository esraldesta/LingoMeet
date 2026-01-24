"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applyForProfessional } from "@/app/actions/professional";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Simplified Professional Signup Steps
// Step 1: Account Info (Email/Password)
// Step 2: Professional Details (Headline, Bio, Price)

export default function ProSignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Step 1: Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Profile
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("0");
  const [languages, setLanguages] = useState([{ language: "", level: "Intermediate" }]); // For simple MVP form

  const handleAccountSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
      }

      if (password.length < 8) {
          setError("Password must be at least 8 characters");
          return;
      }

      // We don't sign up yet, just move to next step
      // Ideally we should validate email existence but let's skip for MVP
      setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
          // 1. Create User Account
          const { data, error: signUpError } = await authClient.signUp.email({
              email,
              password,
              name,
              // We don't redirect yet
          });

          if (signUpError) {
              setError(signUpError.message || "Failed to create account");
              setLoading(false);
              setStep(1); // Go back to fix
              return;
          }

          // 2. Create Professional Profile
          // Note: signUp automatically signs in the user in the client state usually
          // But we need to make sure the session is established for the server action
          
          // Small delay to ensure session propagation? Or better-auth handles it?
          // Let's try calling the action. If it fails due to auth, we might need to handle it.
          
          await applyForProfessional({
              headline,
              bio,
              languages, // Passing the array as is
              pricePerMinute: parseFloat(price),
          });

          toast.success("Account created and application submitted!");
          router.push("/pro");

      } catch (err: any) {
          console.error(err);
          // If account was created but profile failed, we are in a weird state.
          // For MVP, we'll just show error. The user can technically log in and "Apply" again via /pro/apply if that route exists, 
          // or we redirect them to a fix page.
          setError("Account created, but profile submission failed. Please try logging in and applying again.");
          // Ideally redirect to /pro/apply
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <div className="bg-card p-8 rounded-lg shadow-xl w-full max-w-lg border">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">
            {step === 1 ? "Join as a Professional" : "Complete Your Profile"}
            </h1>
            <p className="text-muted-foreground mt-2">
                {step === 1 ? "Create your account to start teaching." : "Tell students about your expertise."}
            </p>
        </div>

        {error && (
          <div className="border border-destructive text-destructive px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        {step === 1 ? (
             <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
                </div>
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="john@example.com" />
                </div>
                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
                </div>
                <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} />
                </div>
                
                <Button type="submit" className="w-full mt-4">Next: Profile Details</Button>
                
                <div className="text-center text-sm mt-4">
                    Already have an account? <Link href="/auth/pro-signin" className="underline">Sign In</Link>
                </div>
             </form>
        ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
                 <div>
                    <Label htmlFor="headline">Professional Headline</Label>
                    <Input id="headline" value={headline} onChange={e => setHeadline(e.target.value)} required placeholder="e.g. Certified Spanish Teacher" />
                </div>
                 <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} required placeholder="Describe your teaching experience..." />
                </div>
                 <div>
                    <Label htmlFor="price">Price per Minute (USD)</Label>
                    <Input id="price" type="number" min="0.1" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
                
                {/* Simplified Language Input for Signup - just one primary language */}
                <div>
                    <Label>Primary Language to Teach</Label>
                    <div className="flex gap-2 mt-1">
                        <Input 
                            value={languages[0].language} 
                            onChange={e => setLanguages([{...languages[0], language: e.target.value}])} 
                            placeholder="Language"
                            required
                        />
                         <Select 
                            value={languages[0].level} 
                            onValueChange={(val) => setLanguages([{...languages[0], level: val}])}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Native">Native</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? "Creating Account..." : "Submit Application"}
                    </Button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
}
