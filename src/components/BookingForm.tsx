"use client";

import { useState, useEffect } from "react";
import { createBooking, getAvailableSlots } from "@/app/actions/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface BookingFormProps {
  professional: any; // Type properly if possible
}

export function BookingForm({ professional }: BookingFormProps) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
      if (date) {
          fetchSlots();
      } else {
          setAvailableSlots([]);
      }
  }, [date, duration]);

  const fetchSlots = async () => {
      setLoadingSlots(true);
      setTime(""); // Reset selected time
      try {
          const slots = await getAvailableSlots(professional.id, date, duration);
          setAvailableSlots(slots);
      } catch (error) {
          console.error(error);
          toast.error("Failed to load available slots");
      } finally {
          setLoadingSlots(false);
      }
  };

  const handleBook = async () => {
    if (!date || !time) {
      toast.error("Please select date and time");
      return;
    }

    setLoading(true);
    try {
        const startTime = new Date(`${date}T${time}`);
        
        await createBooking({
            professionalId: professional.id,
            startTime,
            durationMinutes: duration,
        });
        
        toast.success("Booking confirmed!");
        router.push("/dashboard"); // Redirect to dashboard to see the booking
    } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Booking failed");
    } finally {
        setLoading(false);
    }
  };

  const calculateTotal = () => {
    return (professional.pricePerMinute * duration).toFixed(2);
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm p-6 sticky top-6">
      <h3 className="text-xl font-semibold mb-4">Book a Session</h3>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>Date</Label>
          <Input 
            type="date" 
            min={new Date().toISOString().split('T')[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label>Time</Label>
          {loadingSlots ? (
              <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking availability...
              </div>
          ) : date ? (
              availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {availableSlots.map((slot) => (
                          <Button
                              key={slot}
                              variant={time === slot ? "default" : "outline"}
                              size="sm"
                              onClick={() => setTime(slot)}
                              className="w-full text-xs"
                          >
                              {slot}
                          </Button>
                      ))}
                  </div>
              ) : (
                  <div className="text-sm text-muted-foreground italic">
                      No slots available for this date.
                  </div>
              )
          ) : (
              <div className="text-sm text-muted-foreground">Please select a date first.</div>
          )}
        </div>
        
        <div className="grid gap-2">
            <Label>Duration (minutes)</Label>
            <div className="flex gap-2">
                {[30, 45, 60, 90].map(m => (
                    <Button 
                        key={m} 
                        variant={duration === m ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDuration(m)}
                        className="flex-1"
                    >
                        {m}m
                    </Button>
                ))}
            </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground">Total Price</span>
            <span className="text-xl font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: professional.currency }).format(Number(calculateTotal()))}
            </span>
          </div>
          
          <Button className="w-full size-lg" onClick={handleBook} disabled={loading || !time}>
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            Book Session
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            You won't be charged yet (Demo).
          </p>
        </div>
      </div>
      
      {/* Availability Hint */}
      {professional.availabilities && professional.availabilities.length > 0 && (
          <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> Weekly Schedule
              </h4>
              <div className="flex flex-wrap gap-1">
                  {professional.availabilities.map((a: any, i: number) => (
                      <span key={i} className="text-xs bg-secondary px-2 py-1 rounded">
                           {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][a.dayOfWeek]} {a.startTime}-{a.endTime}
                      </span>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}
