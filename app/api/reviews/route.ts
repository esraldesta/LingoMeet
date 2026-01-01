import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');
    const rating = searchParams.get('rating');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (professionalId) where.professionalId = professionalId;
    if (rating) where.rating = parseInt(rating);

    const [reviews, total] = await Promise.all([
      prisma.professionalReview.findMany({
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
          booking: {
            select: {
              learnerId: true,
              completedAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.professionalReview.count({ where }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      professionalId,
      bookingId,
      learnerId,
      rating,
      comment,
      isPublic,
    } = body;

    if (!professionalId || !bookingId || !learnerId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const existingReview = await prisma.professionalReview.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this booking' },
        { status: 400 }
      );
    }

    const review = await prisma.professionalReview.create({
      data: {
        professionalId,
        bookingId,
        learnerId,
        rating: parseInt(rating),
        comment,
        isPublic: isPublic !== undefined ? isPublic : true,
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
        booking: {
          select: {
            learnerId: true,
            completedAt: true,
          },
        },
      },
    });

    const allReviews = await prisma.professionalReview.findMany({
      where: { professionalId },
    });

    const avgRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;

    await prisma.professional.update({
      where: { id: professionalId },
      data: {
        rating: avgRating,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
