'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_SHORT = ['Su','M','T','W','T','F','S']
const HOURS = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, '0')}:00`
);

interface CellState {
  full: boolean;
  partial: boolean;
  partialPercentage: number; // 0-100, how much of the hour is filled
}

interface AvailabilityCalendarProps {
  slots: TimeSlot[];
  onSlotClick?: (dayOfWeek: number, hour: string) => void;
  onSlotsChange?: (slots: TimeSlot[]) => void;
  isViewOnly?: boolean;
}

export function AvailabilityCalendar({
  slots,
  onSlotClick,
  onSlotsChange,
  isViewOnly = false,
}: AvailabilityCalendarProps) {

  const calendarData = useMemo(() => {
    const grid: CellState[][] = Array(7)
      .fill(null)
      .map(() =>
        Array(24)
          .fill(null)
          .map(() => ({ full: false, partial: false, partialPercentage: 0 }))
      );

    slots.forEach((slot) => {
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);

      // Mark full hours
      for (let hour = startHour; hour < endHour; hour++) {
        grid[slot.dayOfWeek][hour].full = true;
      }

      // Mark partial hour if there's overflow into the next hour
      if (endMin > 0 && endHour < 24) {
        grid[slot.dayOfWeek][endHour].partial = true;
        grid[slot.dayOfWeek][endHour].partialPercentage = (endMin / 60) * 100;
      }
    });

    return grid;
  }, [slots]);

  const handleCellClick = (dayOfWeek: number, hour: number) => {
    if (isViewOnly) return;

    const hourStr = `${String(hour).padStart(2, '0')}:00`;
    const nextHourStr = `${String(hour + 1).padStart(2, '0')}:00`;

    if (onSlotsChange) {
      const cellState = calendarData[dayOfWeek][hour];
      const isCurrentlyAvailable = cellState.full || cellState.partial;

      if (isCurrentlyAvailable) {
        // Remove or shrink the slot
        const updatedSlots = slots
          .map((slot) => {
            if (slot.dayOfWeek !== dayOfWeek) return slot;

            const [startHour] = slot.startTime.split(':').map(Number);
            const [endHour, endMin] = slot.endTime.split(':').map(Number);

            // If clicking on the start hour
            if (startHour === hour) {
              return { ...slot, startTime: nextHourStr };
            }

            // If clicking on the end hour (the partial hour)
            if (endHour === hour && endMin > 0) {
              return { ...slot, endTime: hourStr };
            }

            // If clicking a full hour in the middle, remove it
            if (startHour < hour && endHour > hour) {
              // Shorten from end
              return { ...slot, endTime: hourStr };
            }

            return slot;
          })
          .filter((slot) => {
            // Remove slots where start >= end
            if (!slot) return false;
            const [sH, sM] = slot.startTime.split(':').map(Number);
            const [eH, eM] = slot.endTime.split(':').map(Number);
            return sH < eH || (sH === eH && sM < eM);
          }) as TimeSlot[];

        onSlotsChange(updatedSlots);
      } else {
        // Add or extend the slot
        const existingSlot = slots.find(
          (slot) =>
            slot.dayOfWeek === dayOfWeek && slot.endTime === hourStr
        );

        if (existingSlot) {
          // Extend existing slot by 1 hour
          const updatedSlots = slots.map((slot) =>
            slot === existingSlot
              ? { ...slot, endTime: nextHourStr }
              : slot
          );
          onSlotsChange(updatedSlots);
        } else {
          // Create new 1-hour slot
          onSlotsChange([
            ...slots,
            { dayOfWeek, startTime: hourStr, endTime: nextHourStr },
          ]);
        }
      }
    } else if (onSlotClick) {
      onSlotClick(dayOfWeek, hourStr);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Availability</CardTitle>
        <CardDescription>Green cells indicate available time slots</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto px-1 sm:px-6">
        <div className="min-w-full">
          {/* Header with day names */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-4">
            <div className="h-12 flex items-center justify-center text-xs font-semibold text-muted-foreground">
              Time
            </div>
            {DAYS_OF_WEEK.map((day,i) => (
              <div
                key={day}
                className="h-12 flex items-center justify-center text-xs font-semibold bg-muted rounded-md"
              >
                <span className="sm:hidden">{DAYS_SHORT[i]}</span>
                <span className="hidden sm:inline">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="space-y-1">
            {HOURS.map((time, hourIndex) => (
              <div key={time} className="grid grid-cols-[60px_repeat(7,1fr)] gap-1">
                <div className="h-10 flex items-center justify-center text-xs text-muted-foreground font-medium">
                  {time}
                </div>
                {calendarData.map((daySlots, dayIndex) => {
                  const cellState = daySlots[hourIndex];
                  const isFullyAvailable = cellState.full;
                  const isPartiallyAvailable = cellState.partial && !cellState.full;

                  return (
                    <button
                      key={`${dayIndex}-${hourIndex}`}
                      onClick={() => handleCellClick(dayIndex, hourIndex)}
                      className="relative h-10 rounded border-2 transition-colors overflow-hidden"
                      style={{
                        borderColor: isFullyAvailable
                          ? '#10b981'
                          : isPartiallyAvailable
                            ? '#10b981'
                            : 'var(--border)',
                        backgroundColor: isFullyAvailable
                          ? 'rgb(16, 185, 129, 0.2)'
                          : isPartiallyAvailable
                            ? 'transparent'
                            : 'var(--muted)',
                      }}
                      disabled={isViewOnly}
                      aria-label={`${DAYS_OF_WEEK[dayIndex]} at ${time}`}
                    >
                      {/* Partial fill indicator - fills from top */}
                      {isPartiallyAvailable && (
                        <div
                          className="absolute top-0 left-0 right-0 bg-emerald-500/30"
                          style={{
                            height: `${cellState.partialPercentage}%`,
                            transition: 'height 0.2s ease-in-out',
                          }}
                        />
                      )}
                      {!isViewOnly && (
                        <div className="absolute inset-0 hover:bg-emerald-500/10" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
