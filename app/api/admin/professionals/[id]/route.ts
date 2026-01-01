import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/db';



export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const professional = await prisma.professional.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            image: true,
            role: true,
            createdAt: true,
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
                completedAt: true,
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
    console.error('Error fetching admin professional:', error);
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
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { action, reason } = body;

    const professional = await prisma.professional.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'approve':
        updateData = {
          isVerified: true,
          verificationDate: new Date(),
        };
        message = 'Professional approved successfully';
        break;

      case 'reject':
        updateData = {
          isVerified: false,
        };
        message = 'Professional rejected';
        break;

      case 'deactivate':
        updateData = {
          isVerified: false,
        };
        message = 'Professional deactivated';
        break;

      case 'reactivate':
        updateData = {
          isVerified: true,
        };
        message = 'Professional reactivated';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const updatedProfessional = await prisma.professional.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            name: true,
            image: true,
            role: true,
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
    });

    // Log the admin action
    console.log(`Admin action: ${action} on professional ${id} by admin`, {
      professionalId: id,
      action,
      reason,
      timestamp: new Date(),
    });

    return NextResponse.json({
      professional: updatedProfessional,
      message,
    });
  } catch (error) {
    console.error('Error updating admin professional:', error);
    return NextResponse.json(
      { error: 'Failed to update professional' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const professional = await prisma.professional.findUnique({
      where: { id },
      include: {
        bookings: true,
        reviews: true,
        availability: true,
      },
    });

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      );
    }

    // Check if professional has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        professionalId: id,
        status: {
          in: ['pending', 'confirmed'],
        },
      },
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete professional with active bookings' },
        { status: 400 }
      );
    }

    // Delete related records first
    await prisma.$transaction([
      prisma.professionalReview.deleteMany({
        where: { professionalId: id },
      }),
      prisma.professionalAvailability.deleteMany({
        where: { professionalId: id },
      }),
      prisma.professionalSession.deleteMany({
        where: { professionalId: id },
      }),
      prisma.booking.deleteMany({
        where: { professionalId: id },
      }),
      prisma.professional.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({
      message: 'Professional deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting admin professional:', error);
    return NextResponse.json(
      { error: 'Failed to delete professional' },
      { status: 500 }
    );
  }
}
