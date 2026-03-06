"use server";

import { BookingStatus, RoomStatus } from "@/generated/prisma/enums";
import {
  getNowInTimezone,
  slotInTimezoneToUtc,
  timeStrToMinutes,
} from "@/lib/datetime/timezone";
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
 *
 * @param timeZone - IANA timezone (e.g. "America/New_York"). If provided, "now" and
 *   past-slot checks use the user's timezone; slot boundaries for overlap use this zone too.
 *   If omitted, server timezone is used.
 */
export async function getAvailableSlots(
  professionalId: string,
  dateStr: string,
  durationMinutes: number = 30,
  timeZone?: string
): Promise<string[]> {
  const useUserTz = Boolean(timeZone && timeZone.trim().length > 0);

  // 1. Day boundaries and day-of-week for availability
  let startOfDayUtc: Date;
  let endOfDayUtc: Date;
  let dayOfWeek: number;

  if (useUserTz) {
    startOfDayUtc = slotInTimezoneToUtc(dateStr, "00:00", timeZone!);
    endOfDayUtc = new Date(
      slotInTimezoneToUtc(dateStr, "23:59", timeZone!).getTime() +
        59 * 1000 +
        999
    );
    dayOfWeek = new Date(dateStr + "T12:00:00").getDay();
  } else {
    startOfDayUtc = new Date(dateStr + "T00:00:00");
    endOfDayUtc = new Date(dateStr + "T23:59:59.999");
    dayOfWeek = new Date(dateStr + "T12:00:00").getDay();
  }

  // 2. Professional's availability for that day of week
  const availabilities = await prisma.availability.findMany({
    where: { professionalId, dayOfWeek },
  });

  if (availabilities.length === 0) {
    return [];
  }

  // 3. Bookings that overlap the selected day (in UTC)
  const bookings = await prisma.booking.findMany({
    where: {
      professionalId,
      status: { not: BookingStatus.CANCELED },
      startTime: { lt: endOfDayUtc },
      endTime: { gt: startOfDayUtc },
    },
  });

  // 4. Payments that block slots
  const lockCutoff = new Date(
    Date.now() - SLOT_LOCK_MAX_AGE_MINUTES * 60 * 1000
  );
  const blockingPayments = await prisma.payment.findMany({
    where: {
      professionalId,
      status: { in: ["requires_payment", "processing", "succeeded"] },
      startTime: { lt: endOfDayUtc },
      endTime: { gt: startOfDayUtc },
      OR: [{ status: "succeeded" }, { createdAt: { gte: lockCutoff } }],
    },
  });

  // 5. "Now" for past-slot filter (user TZ or server)
  let nowDateStr: string;
  let nowMinutesSinceMidnight: number;

  if (useUserTz) {
    const nowInTz = getNowInTimezone(timeZone!);
    nowDateStr = nowInTz.dateStr;
    nowMinutesSinceMidnight = nowInTz.minutesSinceMidnight;
  } else {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    nowDateStr = `${y}-${m}-${d}`;
    nowMinutesSinceMidnight =
      now.getHours() * 60 + now.getMinutes();
  }

  const earliestMinutes =
    nowMinutesSinceMidnight + MIN_SLOT_LEAD_MINUTES;
  const slots: string[] = [];

  // 6. Build slots from each availability block
  for (const availability of availabilities) {
    const [startHour, startMin] = availability.startTime.split(":").map(Number);
    const [endHour, endMin] = availability.endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (true) {
      const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`;

      const slotEndHour =
        currentMin + durationMinutes >= 60
          ? currentHour + 1
          : currentHour;
      const slotEndMin = (currentMin + durationMinutes) % 60;
      const slotEndTimeStr = `${slotEndHour.toString().padStart(2, "0")}:${slotEndMin.toString().padStart(2, "0")}`;

      if (currentHour > endHour || (currentHour === endHour && currentMin >= endMin)) {
        break;
      }
      if (
        slotEndHour > endHour ||
        (slotEndHour === endHour && slotEndMin > endMin)
      ) {
        break;
      }

      // Past check (in user or server timezone)
      if (dateStr < nowDateStr) {
        currentMin += 30;
        if (currentMin >= 60) {
          currentHour += 1;
          currentMin -= 60;
        }
        continue;
      }
      if (
        dateStr === nowDateStr &&
        timeStrToMinutes(timeString) < earliestMinutes
      ) {
        currentMin += 30;
        if (currentMin >= 60) {
          currentHour += 1;
          currentMin -= 60;
        }
        continue;
      }

      // Overlap: convert slot to UTC for comparison with DB
      let slotStartUtc: Date;
      let slotEndUtc: Date;

      if (useUserTz) {
        slotStartUtc = slotInTimezoneToUtc(dateStr, timeString, timeZone!);
        slotEndUtc = new Date(
          slotStartUtc.getTime() + durationMinutes * 60 * 1000
        );
      } else {
        slotStartUtc = new Date(dateStr + "T" + timeString + ":00");
        slotEndUtc = new Date(
          slotStartUtc.getTime() + durationMinutes * 60 * 1000
        );
      }

      const bookingOverlap = bookings.some(
        (b) => slotStartUtc < b.endTime && slotEndUtc > b.startTime
      );
      if (bookingOverlap) {
        currentMin += 30;
        if (currentMin >= 60) {
          currentHour += 1;
          currentMin -= 60;
        }
        continue;
      }

      const paymentOverlap = blockingPayments.some(
        (p) => slotStartUtc < p.endTime && slotEndUtc > p.startTime
      );
      if (paymentOverlap) {
        currentMin += 30;
        if (currentMin >= 60) {
          currentHour += 1;
          currentMin -= 60;
        }
        continue;
      }

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