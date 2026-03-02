import prisma from "@/lib/db";
import { BookingStatus, PaymentStatus, RoomStatus, RoomType, type Prisma } from "@/generated/prisma/client";

// Booking-related business logic that is independent of HTTP/Stripe concerns.

/**
 * Create a Room + Booking for a successfully paid Payment record.
 *
 * Idempotent w.r.t. the given payment:
 * - If a booking already exists for this payment, it is returned.
 * - Otherwise a new booking is created and linked to the payment.
 */
export async function createBookingFromPayment(
  tx: Prisma.TransactionClient,
  paymentId: string
) {
  const payment = await tx.payment.findUnique({
    where: { id: paymentId },
    include: {
      professional: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!payment) {
    return null;
  }

  if (payment.bookingId) {
    return tx.booking.findUnique({
      where: { id: payment.bookingId },
      include: {
        professional: true,
        learner: true,
        room: true,
      },
    });
  }

  // Extra safety: check for an overlapping booking that somehow slipped through.
  const overlappingBooking = await tx.booking.findFirst({
    where: {
      professionalId: payment.professionalId,
      status: { not: BookingStatus.CANCELED },
      startTime: { lt: payment.endTime },
      endTime: { gt: payment.startTime },
    },
  });

  if (overlappingBooking) {
    // Mark payment as failed/conflicted so the slot becomes available again
    await tx.payment.update({
      where: { id: payment.id },
      data: {
          status: "failed",
        metadata: {
          ...(typeof payment.metadata === "object" && payment.metadata !== null
            ? payment.metadata
            : {}),
          conflictReason: "overlapping_booking_detected_on_webhook",
        },
      },
    });

    return null;
  }

  const room = await tx.room.create({
    data: {
      name: `Session with ${payment.professional.user.name}`,
      description: "1-on-1 Session",
      language: "en",
      roomType: RoomType.PRIVATE,
      isPublic: false,
      maxParticipants: 2,
      createdBy: payment.learnerId,
      teacherId: payment.professional.userId,
      // status: "scheduled", :TODO check
      status: RoomStatus.ACTIVE,
      scheduledStartTime: payment.startTime,
    },
  });

  const booking = await tx.booking.create({
    data: {
      learnerId: payment.learnerId,
      professionalId: payment.professionalId,
      roomId: room.id,
      startTime: payment.startTime,
      endTime: payment.endTime,
      durationMinutes: payment.durationMinutes,
      totalPrice: payment.amount,
      currency: payment.currency,
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      learner: true,
      professional: true,
      room: true,
    },
  });

  await tx.payment.update({
    where: { id: payment.id },
    data: {
      bookingId: booking.id,
    },
  });

  return booking;
}

