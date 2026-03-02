'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Clock } from 'lucide-react';

interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  id?: string;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AvailabilityManager({
  initialSlots = [],
  onSlotsChange,
  onSave,
  isLoading = false,
}: {
  initialSlots?: TimeSlot[];
  onSlotsChange?: (slots: TimeSlot[]) => void;
  onSave?: (slots: TimeSlot[]) => Promise<void>;
  isLoading?: boolean;
}) {
  const [slots, setSlots] = useState<TimeSlot[]>(initialSlots);
  const [isSaving, setIsSaving] = useState(false);

  // Update external state when slots change
  const handleSlotsUpdate = (newSlots: TimeSlot[]) => {
    setSlots(newSlots);
    if (onSlotsChange) {
      onSlotsChange(newSlots);
    }
  };

  const addTimeSlot = useCallback((dayOfWeek: number) => {
    setSlots((prev) => {
      const newSlots = [
        ...prev,
        {
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
        },
      ];
      if (onSlotsChange) {
        onSlotsChange(newSlots);
      }
      return newSlots;
    });
  }, [onSlotsChange]);

  const updateSlot = useCallback((index: number, updates: Partial<TimeSlot>) => {
    setSlots((prev) => {
      const newSlots = [...prev];
      newSlots[index] = { ...newSlots[index], ...updates };
      if (onSlotsChange) {
        onSlotsChange(newSlots);
      }
      return newSlots;
    });
  }, [onSlotsChange]);

  const removeSlot = useCallback((index: number) => {
    setSlots((prev) => {
      const newSlots = prev.filter((_, i) => i !== index);
      if (onSlotsChange) {
        onSlotsChange(newSlots);
      }
      return newSlots;
    });
  }, [onSlotsChange]);

  const handleSave = async () => {
    if (onSave == undefined) return;
    setIsSaving(true);
    try {
      await onSave(slots);
    } finally {
      setIsSaving(false);
    }
  };

  const slotsByDay = DAYS_OF_WEEK.map((_, dayIndex) =>
    slots.filter((slot) => slot.dayOfWeek === dayIndex)
  );

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Set Your Availability
          </CardTitle>
          <CardDescription>
            Add your available time slots for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {DAYS_OF_WEEK.map((day, dayIndex) => (
            <div key={dayIndex} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base">{day}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTimeSlot(dayIndex)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Slot
                </Button>
              </div>

              {slotsByDay[dayIndex].length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">Not available</p>
              ) : (
                <div className="space-y-2 ml-4">
                  {slotsByDay[dayIndex].map((slot, slotIndex) => {
                    const globalIndex = slots.findIndex(
                      (s) => s.dayOfWeek === dayIndex && slots.indexOf(s) === slots.indexOf(slot)
                    );
                    const actualIndex = slots.indexOf(slot);

                    return (
                      <div key={actualIndex} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateSlot(actualIndex, { startTime: e.target.value })}
                            className="w-24"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(actualIndex, { endTime: e.target.value })}
                            className="w-24"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSlot(actualIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setSlots(initialSlots);
            if (onSlotsChange) {
              onSlotsChange(initialSlots);
            }
          }}
          disabled={isSaving || isLoading}
        >
          Reset
        </Button>
        {onSave && (
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? 'Saving...' : 'Save Availability'}
          </Button>
        )}
      </div>
    </div>
  );
}
