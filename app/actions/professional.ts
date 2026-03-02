"use server";

import { Currency, LanguageLevel } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function registerProfessional(data: {
  email: string;
  password: string;
  name: string;
  headline: string;
  bio: string;
  language: string;
  level: LanguageLevel;
  pricePerMinute: number;
}) {
  return await prisma.$transaction(async (tx) => {

    // Create user using Better Auth
    const { user } = await auth.api.createUser({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: "pro"
      },
    });

    if (!user) {
      throw new Error("User creation failed");
    }

    // Create professional profile
    const profile = await tx.professional.create({
      data: {
        userId: user.id,
        headline: data.headline,
        bio: data.bio,
        language: data.language,
        level: data.level,
        pricePerMinute: data.pricePerMinute,
        currency: "USD",
        isVerified: false,
      },
    });

    // Assign "pro" role
    // await auth.api.setRole({
    //     body: {
    //         userId: user.id,
    //         role: "pro",
    //     },
    //     headers: await headers(),
    // });
    // revalidatePath("/pro");

    return { user, profile };
  });
}

export async function getPendingProfessionals() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });


  if (!session || session.user.role !== "admin") {
    return redirect("/auth/signin?message=please use student account to access the student pages")
  }
  const professionals = await prisma.professional.findMany({
    where: {
      isVerified: false
    },
    include: {
      user: true
    }
  });

  return professionals;
}

export async function approveProfessional(professionalId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });


  if (!session || session.user.role !== "admin") {
    return redirect("/auth/signin?message=please use student account to access the student pages")
  }

  const professional = await prisma.professional.update({
    where: { id: professionalId },
    data: {
      isVerified: true
    }
  });


  revalidatePath("/admin");
  return professional;
}

type GetProfessionalsFilters = {
  language?: string;
  level?: LanguageLevel;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  limit?: number;
};

export async function getPublicProfessionals(
  filters?: GetProfessionalsFilters
) {
  const page = filters?.page && filters.page > 0 ? filters.page : 1;
  const limit = filters?.limit && filters.limit > 0 ? filters.limit : 10;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    isVerified: true,
  };

  if (filters?.language) {
    whereClause.language = filters.language;
  }

  if (filters?.level) {
    whereClause.level = filters.level;
  }

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    whereClause.pricePerMinute = {};
    if (filters.minPrice !== undefined) {
      whereClause.pricePerMinute.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      whereClause.pricePerMinute.lte = filters.maxPrice;
    }
  }

  if (filters?.minRating !== undefined) {
    whereClause.rating = {
      gte: filters.minRating,
    };
  }

  const [professionals, total] = await Promise.all([
    prisma.professional.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        rating: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        // reviews: true,

      },
    }),
    prisma.professional.count({
      where: whereClause,
    }),
  ]);

    const serializedProfessionals = professionals.map((p) => ({
    ...p,
    pricePerMinute: p.pricePerMinute.toString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));


  return {
    data: serializedProfessionals,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
}

export async function getProfessionalById(id: string) {
  const professional = await prisma.professional.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      availabilities: true,
      reviews: {
        include: {
          learner: {
            select: {
              name: true,
              image: true,
            }
          }
        }
      },
    },
  });
  return professional;
}


export async function getProfessionalProfile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const profile = await prisma.professional.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      availabilities: true,
    },
  });

  return profile;
}


export async function updateProfessionalProfile(data: {
  bio: string;
  headline: string;
  language: string;
  level: LanguageLevel;
  pricePerMinute: number;
  currency: Currency;
}) {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "pro") {
    throw new Error("Unauthorized");
  }


  const profile = await prisma.professional.upsert({
    where: {
      userId: session.user.id,
    },
    update: {
      bio: data.bio,
      headline: data.headline,
      language: data.language,
      level:    data.level,
      pricePerMinute: data.pricePerMinute,
      currency: data.currency,
    },
    create: {
      userId: session.user.id,
      bio: data.bio,
      headline: data.headline,
      language: data.language,
      level:    data.level,
      pricePerMinute: data.pricePerMinute,
      currency: data.currency,
    },
  });

  revalidatePath("/pro");
  revalidatePath(`/professionals/${profile.id}`);
  
  return profile;
}



export async function updateAvailability(slots: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "pro") {
    throw new Error("Unauthorized");
  }

  const profile = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Replace all availabilities for simplicity in this MVP
  await prisma.$transaction(async (tx) => {
    await tx.availability.deleteMany({
      where: { professionalId: profile.id },
    });

    if (slots.length > 0) {
      await tx.availability.createMany({
        data: slots.map((slot) => ({
          professionalId: profile.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      });
    }
  });

  revalidatePath("/pro");
  return { success: true };
}