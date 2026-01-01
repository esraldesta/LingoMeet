import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        professional: {
          include: {
            user: {
              select: {
                email: true,
                image: true,
              },
            },
          },
        },
        session: true,
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, paymentStatus, notes } = body;

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'confirmed') {
        updateData.confirmedAt = new Date();
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        professional: {
          include: {
            user: {
              select: {
                email: true,
                image: true,
              },
            },
          },
        },
        session: true,
        review: true,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
