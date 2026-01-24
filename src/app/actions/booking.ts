"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBooking(data: {
  professionalId: string;
  startTime: Date;
  durationMinutes: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const professional = await prisma.professional.findUnique({
    where: { id: data.professionalId },
    include: { user: true },
  });

  if (!professional) {
    throw new Error("Professional not found");
  }

  // Double-check availability before confirming
  // Ideally we lock this, but for MVP just check again
  const startTime = data.startTime;
  const endTime = new Date(startTime.getTime() + data.durationMinutes * 60000);

  const overlappingBooking = await prisma.booking.findFirst({
      where: {
          professionalId: professional.id,
          status: { not: "canceled" }, // Ignore canceled
          OR: [
              {
                  startTime: { lt: endTime },
                  endTime: { gt: startTime }
              }
          ]
      }
  });

  if (overlappingBooking) {
      throw new Error("Time slot is no longer available");
  }

  // Calculate Price
  const totalPrice = Number(professional.pricePerMinute) * data.durationMinutes;

  // Create Room for the session
  const room = await prisma.room.create({
    data: {
      name: `Session with ${professional.user.name}`,
      description: `1-on-1 Session`,
      language: "en", // Default or selected
      roomType: "private", // new type or existing? Default is general
      isPublic: false,
      maxParticipants: 2,
      createdBy: session.user.id,
      teacherId: professional.userId,
      status: "scheduled",
      scheduledStartTime: data.startTime,
    },
  });

  // Create Booking
  const booking = await prisma.booking.create({
    data: {
      learnerId: session.user.id,
      professionalId: professional.id,
      roomId: room.id,
      startTime: data.startTime,
      endTime: endTime,
      durationMinutes: data.durationMinutes,
      totalPrice: totalPrice,
      currency: professional.currency,
      status: "confirmed", // Auto-confirm for MVP
      paymentStatus: "paid", // Mock payment
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/professionals/${data.professionalId}`);
  
  return booking;
}

export async function getUserBookings() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return [];
  }

  const bookings = await prisma.booking.findMany({
    where: {
      learnerId: session.user.id,
    },
    include: {
      professional: {
        include: {
          user: true
        }
      },
      room: true
    },
    orderBy: {
      startTime: 'desc'
    }
  });

  return bookings;
}

export async function getProfessionalBookings() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id }
  });

  if (!professional) {
     throw new Error("Professional profile not found");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      professionalId: professional.id,
    },
    include: {
      learner: {
        select: {
          name: true,
          image: true,
          email: true
        }
      },
      room: true
    },
    orderBy: {
      startTime: 'desc'
    }
  });

  return bookings;
}

export async function completeSession(roomId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Verify user is the professional for this room
    const booking = await prisma.booking.findFirst({
        where: { roomId: roomId },
        include: { professional: true }
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.professional.userId !== session.user.id) {
        throw new Error("Unauthorized: You are not the professional for this session");
    }

    // Update booking status
    await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "completed" }
    });
    
    // Update room status
    await prisma.room.update({
        where: { id: roomId },
        data: { status: "completed" }
    });
    
    revalidatePath("/pro/sessions");
    return { success: true };
}

export async function getAvailableSlots(professionalId: string, dateStr: string, durationMinutes: number = 30) {
    // 1. Get the date and day of week
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0-6

    // 2. Get Professional Availability for that day (Find all slots for the day)
    const availabilities = await prisma.availability.findMany({
        where: {
            professionalId: professionalId,
            dayOfWeek: dayOfWeek
        }
    });

    if (availabilities.length === 0) {
        return [];
    }

    // 3. Get existing bookings for that professional on that date
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
        where: {
            professionalId: professionalId,
            status: { not: "canceled" }, // Ignore canceled bookings
            startTime: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    });

    const slots: string[] = [];
    const now = new Date();

    // 4. Iterate over EACH availability block
    for (const availability of availabilities) {
        // Parse start/end times from availability (e.g., "09:00" -> hours/mins)
        const [startHour, startMin] = availability.startTime.split(':').map(Number);
        const [endHour, endMin] = availability.endTime.split(':').map(Number);

        // Create availability start and end dates for the day
        const availStart = new Date(dateStr);
        availStart.setHours(startHour, startMin, 0, 0);
        
        const availEnd = new Date(dateStr);
        availEnd.setHours(endHour, endMin, 0, 0);

        // Let's iterate in 30 minute increments for start times
        let currentHour = startHour;
        let currentMin = startMin;

        while (true) {
            // Construct slot start date
            const slotDate = new Date(dateStr);
            slotDate.setHours(currentHour, currentMin, 0, 0);
            
            // Stop if start time is past availability end
            if (slotDate >= availEnd) break;

            // Calculate potential end time based on DURATION
            const slotEndDate = new Date(slotDate.getTime() + durationMinutes * 60000);

            // Check if the entire duration fits within THIS availability block
            if (slotEndDate > availEnd) {
                 // Too close to end of block, break to next block
                 break; 
            }

            // Check overlap with existing bookings
            const isOverlap = bookings.some(b => {
                // Check if (SlotStart < BookingEnd) and (SlotEnd > BookingStart)
                return slotDate < b.endTime && slotEndDate > b.startTime;
            });

            // Also check if slot is in the past (if today)
            const isPast = slotDate < now;

            if (!isOverlap && !isPast) {
                // Format time as HH:mm
                const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
                
                // Avoid duplicates if multiple blocks overlap (unlikely in valid config but good to be safe)
                if (!slots.includes(timeString)) {
                    slots.push(timeString);
                }
            }

            // Increment start time by 30 mins
            currentMin += 30;
            if (currentMin >= 60) {
                currentHour += 1;
                currentMin -= 60;
            }
        }
    }

    // Sort slots chronologically
    return slots.sort();
}
