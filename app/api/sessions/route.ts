import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');
    const status = searchParams.get('status');
    const language = searchParams.get('language');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (professionalId) where.professionalId = professionalId;
    if (status) where.status = status;
    if (language) where.language = language;

    const [sessions, total] = await Promise.all([
      prisma.professionalSession.findMany({
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
          booking: true,
          _count: {
            select: {
              participants: true,
            },
          },
        },
        orderBy: {
          scheduledStart: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.professionalSession.count({ where }),
    ]);

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      professionalId,
      title,
      description,
      language,
      maxParticipants,
      pricePerMinute,
      scheduledStart,
      scheduledEnd,
    } = body;

    if (!professionalId || !language || !scheduledStart || !scheduledEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const session = await prisma.professionalSession.create({
      data: {
        professionalId,
        title,
        description,
        language,
        maxParticipants: maxParticipants || 1,
        pricePerMinute: parseFloat(pricePerMinute || '0'),
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
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
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
