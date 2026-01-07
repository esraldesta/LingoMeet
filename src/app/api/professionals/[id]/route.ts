import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const professional = await prisma.professional.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            image: true,
          },
        },
        availability: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
        reviews: {
          include: {
            booking: {
              select: {
                learnerId: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
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
    });

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(professional);
  } catch (error) {
    console.error('Error fetching professional:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professional' },
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

    const professional = await prisma.professional.update({
      where: { id },
      data: {
        ...(displayName && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(languages && { languages }),
        ...(certifications !== undefined && { certifications }),
        ...(experience !== undefined && { experience }),
        ...(accent !== undefined && { accent }),
        ...(level && { level }),
        ...(pricePerMinute && { pricePerMinute: parseFloat(pricePerMinute) }),
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

    return NextResponse.json(professional);
  } catch (error) {
    console.error('Error updating professional:', error);
    return NextResponse.json(
      { error: 'Failed to update professional' },
      { status: 500 }
    );
  }
}
