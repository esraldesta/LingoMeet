"use client";

import { useEffect, useState } from "react";
import { getProfessionalProfile, updateProfessionalProfile, updateAvailability } from "@/app/actions/professional";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash, Save, Loader2, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Language {
  language: string;
  level: string;
}

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function ProfessionalProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile State
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("0");
  const [languages, setLanguages] = useState<Language[]>([]);
  
  // Availability State
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const profile = await getProfessionalProfile();
      if (profile) {
        setHeadline(profile.headline || "");
        setBio(profile.bio || "");
        setPrice(profile.pricePerMinute?.toString() || "0");
        // Safe cast for JSON
        if (Array.isArray(profile.languages)) {
            setLanguages(profile.languages as unknown as Language[]);
        }
        
        if (profile.availabilities) {
           setAvailability(profile.availabilities.map(a => ({
               dayOfWeek: a.dayOfWeek,
               startTime: a.startTime,
               endTime: a.endTime
           })));
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
    setSaving(true);
    try {
      await updateProfessionalProfile({
        headline,
        bio,
        pricePerMinute: parseFloat(price),
        currency: "USD",
        languages,
      });
      
      await updateAvailability(availability);
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const addLanguage = () => {
    setLanguages([...languages, { language: "", level: "Intermediate" }]);
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const updateLanguage = (index: number, field: keyof Language, value: string) => {
    const newLanguages = [...languages];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    setLanguages(newLanguages);
  };

  const addAvailability = () => {
    setAvailability([...availability, { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }]);
  };

  const removeAvailability = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateAvailabilitySlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const newAvailability = [...availability];
    newAvailability[index] = { ...newAvailability[index], [field]: value };
    setAvailability(newAvailability);
  };

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
        <Button onClick={handleSaveProfile} disabled={saving}>
          {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

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
              className="min-h-[100px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Price per minute (USD)</Label>
            <Input 
              id="price" 
              type="number" 
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Languages Section */}
        <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Languages</h2>
            <Button variant="outline" size="sm" onClick={addLanguage}>
              <Plus className="w-4 h-4 mr-2" /> Add Language
            </Button>
          </div>
          
          <div className="space-y-4">
            {languages.map((lang, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Language</Label>
                  <Input 
                    value={lang.language} 
                    onChange={(e) => updateLanguage(index, "language", e.target.value)}
                    placeholder="e.g. Spanish"
                  />
                </div>
                <div className="w-[200px] space-y-2">
                  <Label>Level</Label>
                  <Select 
                    value={lang.level} 
                    onValueChange={(val) => updateLanguage(index, "level", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Native">Native</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeLanguage(index)}>
                  <Trash className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            {languages.length === 0 && (
              <p className="text-muted-foreground text-sm italic">No languages added yet.</p>
            )}
          </div>
        </div>

        {/* Availability Section */}
        <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Weekly Availability
            </h2>
            <Button variant="outline" size="sm" onClick={addAvailability}>
              <Plus className="w-4 h-4 mr-2" /> Add Slot
            </Button>
          </div>

          <div className="space-y-4">
            {availability.map((slot, index) => (
              <div key={index} className="flex gap-4 items-end flex-wrap sm:flex-nowrap">
                <div className="w-[150px] space-y-2">
                  <Label>Day</Label>
                  <Select 
                    value={slot.dayOfWeek.toString()} 
                    onValueChange={(val) => updateAvailabilitySlot(index, "dayOfWeek", parseInt(val))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day, i) => (
                        <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Start Time</Label>
                  <Input 
                    type="time" 
                    value={slot.startTime}
                    onChange={(e) => updateAvailabilitySlot(index, "startTime", e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>End Time</Label>
                  <Input 
                    type="time" 
                    value={slot.endTime}
                    onChange={(e) => updateAvailabilitySlot(index, "endTime", e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeAvailability(index)}>
                  <Trash className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
             {availability.length === 0 && (
              <p className="text-muted-foreground text-sm italic">No availability slots set. You won't appear in search results.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
