"use client";

import { useEffect, useState } from "react";
import {
  getProfessionalProfile,
  updateProfessionalProfile,
  updateAvailability,
} from "@/app/actions/professional";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Loader2, Clock, Banknote } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/public/constants";
import { Currency, LanguageLevel } from "@/generated/prisma/enums";
import { AvailabilityManager } from "@/components/availability-manager";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getStripeOnboardingLinkForCurrentProfessional, refreshCurrentProfessionalStripeAccount } from "@/app/actions/payments";

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function ProfessionalProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  
  // Profile State
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState<string | null>(null);
  const [level, setLevel] = useState<LanguageLevel | null>(null);
  
  // Availability State
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const profile = await getProfessionalProfile();
      if (profile) {
        setProfile(profile);
        setHeadline(profile.headline || "");
        setBio(profile.bio || "");
        setPrice(profile.pricePerMinute?.toString() || "0");
        setCurrency(profile.currency || "USD");
        setLanguage(profile.language);
        setLevel(profile.level);
        
        if (profile.availabilities) {
          setAvailability(
            profile.availabilities.map((a: any) => ({
              dayOfWeek: a.dayOfWeek,
              startTime: a.startTime,
              endTime: a.endTime,
            }))
          );
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!language || !level) {
      toast.error("Please select a language and level");
      return;
    }

    setSaving(true);
    try {
      await updateProfessionalProfile({
        headline,
        bio,
        pricePerMinute: parseFloat(price),
        currency: currency as Currency,
        language: language as string,
        level: level as LanguageLevel,
      });
      
      await updateAvailability(availability);
      
      toast.success("Profile updated successfully");
      setViewMode("preview");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const isStripeReady =
    !!profile?.stripeAccountId &&
    profile?.stripeChargesEnabled &&
    profile?.stripePayoutsEnabled;

    async function handleStartStripeOnboarding() {
      setStripeLoading(true);
      try {
        const { url } = await getStripeOnboardingLinkForCurrentProfessional();
        window.location.href = url;
      } catch (error) {
        console.error(error);
        toast.error("Failed to start Stripe onboarding");
      } finally {
        setStripeLoading(false);
      }
    }

    async function handleRefreshStripeStatus() {
      setStripeLoading(true);
      try {
        const updated = await refreshCurrentProfessionalStripeAccount();
        setProfile((prev: any) => ({
          ...(prev ?? {}),
          ...updated,
        }));
        toast.success("Stripe account status refreshed");
      } catch (error) {
        console.error(error);
        toast.error("Failed to refresh Stripe status");
      } finally {
        setStripeLoading(false);
      }
    }
  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        {viewMode === "edit" && (
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        )}
        {viewMode === "preview" && (
          <Button variant="outline" onClick={() => setViewMode("edit")}>
            Edit Profile
          </Button>
        )}
      </div>

      {viewMode === "edit" ? (
        <div className="grid gap-8">
          {/* Profile Section */}
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold">Profile Details</h2>
            
            <div className="grid gap-2">
              <Label htmlFor="headline">Headline</Label>
              <Input 
                id="headline" 
                placeholder="e.g. Certified Spanish Teacher with 5 years experience"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell students about yourself..."
                className="min-h-25"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price per minute</Label>
                <Input 
                  id="price" 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Languages Section */}
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold">Teaching Language</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Primary Language to Teach</Label>
                <Select value={language || ""} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Language Level</Label>
                <Select value={level || ""} onValueChange={(val: any) => setLevel(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LanguageLevel.NATIVE}>Native</SelectItem>
                    <SelectItem value={LanguageLevel.ADVANCED}>Advanced</SelectItem>
                    <SelectItem value={LanguageLevel.INTERMEDIATE}>Intermediate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Availability Section with Tabs */}
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Weekly Availability</h2>
            </div>

            <Tabs defaultValue="calendar" className="w-full">
              <TabsList>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                <TabsTrigger value="editor">Editor</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="mt-6">
                <AvailabilityManager 
                  initialSlots={availability}
                  onSlotsChange={setAvailability}
                  onSave={async (slots) => {
                    try {
                      await updateAvailability(slots);
                      toast.success("Availability updated successfully");
                    } catch (error) {
                      toast.error("Failed to update availability");
                      console.error(error);
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="calendar" className="mt-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
                    <p className="text-blue-900 dark:text-blue-100">
                      <span className="font-semibold">Tip:</span> Click on any time slot to toggle availability. Green slots are available, gray slots are unavailable.
                    </p>
                  </div>
                  <AvailabilityCalendar 
                    slots={availability}
                    isViewOnly={false}
                    onSlotsChange={setAvailability}
                  />
                  <Button 
                    onClick={async () => {
                      try {
                        await updateAvailability(availability);
                        toast.success("Availability updated successfully");
                      } catch (error) {
                        toast.error("Failed to update availability");
                        console.error(error);
                      }
                    }}
                    className="w-full"
                  >
                    Save Availability
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Payouts / Stripe Connect Section */}
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                Payouts & Stripe Connect
              </h2>
            </div>

            <div className="space-y-2 text-sm">
              {isStripeReady ? (
                <>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Your Stripe Express account is ready. You can receive payouts
                    for bookings.
                  </p>
                  <p className="text-muted-foreground">
                    If Stripe ever restricts your account (for example, missing
                    verification), new bookings will automatically be blocked
                    until you resolve it.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-amber-600 dark:text-amber-400 font-medium">
                    You need to complete Stripe onboarding before students can
                    book paid sessions with you.
                  </p>
                  <p className="text-muted-foreground">
                    Stripe securely handles all payments and payouts. We never
                    store your bank details.
                  </p>
                </>
              )}

              {profile?.stripeAccountId && !isStripeReady && (
                <p className="text-xs text-muted-foreground">
                  Stripe account ID: {profile.stripeAccountId}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleStartStripeOnboarding}
                disabled={stripeLoading}
              >
                {stripeLoading ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : null}
                {profile?.stripeAccountId
                  ? "Continue Stripe onboarding"
                  : "Set up payouts with Stripe"}
              </Button>

              {profile?.stripeAccountId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRefreshStripeStatus}
                  disabled={stripeLoading}
                >
                  Refresh status
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Preview Mode
        <div className="grid gap-8">
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-4">
            <h2 className="text-2xl font-bold">{headline || "Your headline"}</h2>
            <p className="text-muted-foreground">{bio || "Your bio will appear here"}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Language</p>
                <p className="font-semibold">{language}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Level</p>
                <p className="font-semibold">{level}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Price</p>
                <p className="font-semibold">${price} {currency}/min</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Your Availability
            </h3>
            <AvailabilityCalendar 
              slots={availability}
              isViewOnly={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
