import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const learnerId = searchParams.get('learnerId');
    const professionalId = searchParams.get('professionalId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (learnerId) where.learnerId = learnerId;
    if (professionalId) where.professionalId = professionalId;
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
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
        orderBy: {
          bookedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      professionalId,
      sessionId,
      learnerId,
      totalPrice,
      platformFee,
      professionalEarnings,
      notes,
    } = body;

    if (!professionalId || !sessionId || !learnerId || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const session = await prisma.professionalSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        professionalId,
        sessionId,
        learnerId,
        totalPrice: parseFloat(totalPrice),
        platformFee: parseFloat(platformFee || (totalPrice * 0.25).toString()),
        professionalEarnings: parseFloat(professionalEarnings || (totalPrice * 0.75).toString()),
        notes,
      },
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
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
