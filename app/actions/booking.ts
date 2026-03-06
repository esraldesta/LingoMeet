"use server";

import { BookingStatus, RoomStatus } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createCheckoutSessionForBooking } from "@/lib/services/stripeService";

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
        data: { status: BookingStatus.COMPLETED}
    });
    
    // Update room status
    await prisma.room.update({
        where: { id: roomId },
        data: { status: RoomStatus.COMPLETED }
    });
    
    revalidatePath("/pro/sessions");
    return { success: true };
}


/** Minimum minutes from now before a slot can be offered (avoids slot disappearing during checkout). */
const MIN_SLOT_LEAD_MINUTES = Number(process.env.MIN_SLOT_LEAD_MINUTES ?? "5");

/** Same as in stripeService: only payments created within this window block slots (abandoned carts free the slot). */
const SLOT_LOCK_MAX_AGE_MINUTES = Number(process.env.SLOT_LOCK_MAX_AGE_MINUTES ?? "30");

/**
 * Get available time slots for a professional on a given date.
 * All logic runs on the backend: current time, existing bookings, and payment locks.
 */
export async function getAvailableSlots(
  professionalId: string,
  dateStr: string,
  durationMinutes: number = 30
): Promise<string[]> {
  // 1. Parse the selected date as local calendar date (YYYY-MM-DD → start/end of day in local time)
  const startOfDay = new Date(dateStr + "T00:00:00");
  const endOfDay = new Date(dateStr + "T23:59:59.999");
  const date = new Date(startOfDay);
  const dayOfWeek = date.getDay(); // 0-6

  // 2. Get professional's availability windows for that day of week
  const availabilities = await prisma.availability.findMany({
    where: {
      professionalId,
      dayOfWeek,
    },
  });

  if (availabilities.length === 0) {
    return [];
  }

  // 3. Fetch existing bookings for that professional on that date (excludes canceled)
  const bookings = await prisma.booking.findMany({
    where: {
      professionalId,
      status: { not: BookingStatus.CANCELED },
      startTime: { lt: endOfDay },
      endTime: { gt: startOfDay },
    },
  });

  // 4. Fetch payments that block slots: succeeded (booking exists/will exist) or recent requires_payment/processing
  const lockCutoff = new Date(
    Date.now() - SLOT_LOCK_MAX_AGE_MINUTES * 60 * 1000
  );
  const blockingPayments = await prisma.payment.findMany({
    where: {
      professionalId,
      status: { in: ["requires_payment", "processing", "succeeded"] },
      startTime: { lt: endOfDay },
      endTime: { gt: startOfDay },
      OR: [
        { status: "succeeded" },
        { createdAt: { gte: lockCutoff } },
      ],
    },
  });

  const now = new Date();
  const earliestAllowedStart = new Date(
    now.getTime() + MIN_SLOT_LEAD_MINUTES * 60 * 1000
  );
  const slots: string[] = [];

  // 5. Build slots from each availability block
  for (const availability of availabilities) {
    const [startHour, startMin] = availability.startTime.split(":").map(Number);
    const [endHour, endMin] = availability.endTime.split(":").map(Number);

    const availStart = new Date(dateStr + "T00:00:00");
    availStart.setHours(startHour, startMin, 0, 0);
    const availEnd = new Date(dateStr + "T00:00:00");
    availEnd.setHours(endHour, endMin, 0, 0);

    let currentHour = startHour;
    let currentMin = startMin;

    while (true) {
      const slotStart = new Date(dateStr + "T00:00:00");
      slotStart.setHours(currentHour, currentMin, 0, 0);
      if (slotStart >= availEnd) break;

      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
      if (slotEnd > availEnd) break;

      // Must not be in the past (or within the lead-time buffer)
      if (slotStart < earliestAllowedStart) {
        currentMin += 30;
        if (currentMin >= 60) {
          currentHour += 1;
          currentMin -= 60;
        }
        continue;
      }

      // Must not overlap any existing booking
      const bookingOverlap = bookings.some(
        (b) => slotStart < b.endTime && slotEnd > b.startTime
      );
      if (bookingOverlap) {
        currentMin += 30;
        if (currentMin >= 60) {
          currentHour += 1;
          currentMin -= 60;
        }
        continue;
      }

      // Must not overlap any blocking payment (succeeded or recent pending/processing)
      const paymentOverlap = blockingPayments.some(
        (p) => slotStart < p.endTime && slotEnd > p.startTime
      );
      if (paymentOverlap) {
        currentMin += 30;
        if (currentMin >= 60) {
          currentHour += 1;
          currentMin -= 60;
        }
        continue;
      }

      const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`;
      if (!slots.includes(timeString)) {
        slots.push(timeString);
      }

      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin -= 60;
      }
    }
  }

  return slots.sort();
}


export async function startBookingCheckout(data: {
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
  });

  if (!professional) {
    throw new Error("Professional not found");
  }

  const startTime = data.startTime;
  const endTime = new Date(startTime.getTime() + data.durationMinutes * 60000);

  // Calculate price in major units (e.g. dollars)
  const totalPrice =
    Number(professional.pricePerMinute) * data.durationMinutes;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured");
  }
  const baseUrl = appUrl.replace(/\/$/, "");

  const { checkoutUrl, sessionId } = await createCheckoutSessionForBooking({
    learnerId: session.user.id,
    professionalId: professional.id,
    startTime,
    endTime,
    durationMinutes: data.durationMinutes,
    amount: totalPrice,
    currency: professional.currency,
    successUrl: `${baseUrl}/home/sessions?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/professionals/${professional.id}?stripe=canceled`,
  });

  // Revalidate listing pages so that any slot-availability indicators can react
  revalidatePath("/home");
  revalidatePath(`/professionals/${professional.id}`);

  return {
    checkoutUrl,
    sessionId,
  };
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