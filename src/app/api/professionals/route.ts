import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const level = searchParams.get('level');
    const minRating = searchParams.get('minRating');
    const verified = searchParams.get('verified');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      isVerified: verified === 'true' ? true : undefined,
    };

    if (language) {
      where.languages = {
        has: language,
      };
    }

    if (level) {
      where.level = level;
    }

    if (minRating) {
      where.rating = {
        gte: parseFloat(minRating),
      };
    }

    const [professionals, total] = await Promise.all([
      prisma.professional.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              bookings: {
                where: {
                  status: 'completed',
                },
              },
            },
          },
        },
        orderBy: {
          rating: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.professional.count({ where }),
    ]);

    return NextResponse.json({
      professionals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professionals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {

    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const {
      displayName,
      bio,
      languages,
      certifications,
      experience,
      accent,
      level,
      pricePerMinute,
    } = body;


    if (!userId || !displayName || !languages || languages.length === 0 || !level || !pricePerMinute) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingProfessional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (existingProfessional) {
      return NextResponse.json(
        { error: 'Professional profile already exists for this user' },
        { status: 400 }
      );
    }

    const professional = await prisma.professional.create({
      data: {
        userId,
        displayName,
        bio,
        languages,
        certifications: certifications || [],
        experience,
        accent,
        level,
        pricePerMinute: parseFloat(pricePerMinute),
      },
      include: {
        user: {
          select: {
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(professional, { status: 201 });
  } catch (error) {
    console.error('Error creating professional:', error);
    return NextResponse.json(
      { error: 'Failed to create professional profile' },
      { status: 500 }
    );
  }
}
