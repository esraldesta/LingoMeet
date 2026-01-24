"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

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
  languages: any; // Using any for JSON for now, can be stricter
  pricePerMinute: number;
  currency: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Check if user is allowed to be a professional? 
  // For now, anyone can create a profile, or we check role.
  // Assuming role check happens elsewhere or we auto-upgrade.

  const profile = await prisma.professional.upsert({
    where: {
      userId: session.user.id,
    },
    update: {
      bio: data.bio,
      headline: data.headline,
      languages: data.languages,
      pricePerMinute: data.pricePerMinute,
      currency: data.currency,
    },
    create: {
      userId: session.user.id,
      bio: data.bio,
      headline: data.headline,
      languages: data.languages,
      pricePerMinute: data.pricePerMinute,
      currency: data.currency,
    },
  });

  revalidatePath("/pro/dashboard");
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

  if (!session) {
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

  revalidatePath("/pro/dashboard");
  return { success: true };
}

export async function getAllProfessionals(filters?: {
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}) {
  const whereClause: any = {
    isVerified: true,
  };

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

  let professionals = await prisma.professional.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      reviews: true,
    },
  });

  // Filter by language in memory (since JSON filtering for partial array match is complex in Prisma/Postgres without Raw SQL)
  if (filters?.language) {
    const searchLang = filters.language.toLowerCase();
    professionals = professionals.filter((pro) => {
      if (!Array.isArray(pro.languages)) return false;
      return pro.languages.some((l: any) => 
        l.language?.toLowerCase().includes(searchLang)
      );
    });
  }

  return professionals;
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

export async function getPendingProfessionals() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    
    // Check admin permission logic here if needed, or rely on page level check
    
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

    // Check if admin?
    
    const professional = await prisma.professional.update({
        where: { id: professionalId },
        data: {
            isVerified: true
        },
        include: {
            user: true
        }
    });
    
    // Update user role to 'pro'
    // using better-auth api
    await auth.api.setRole({
        headers: await headers(),
        body: {
            userId: professional.userId,
            role: "pro"
        }
    });
    
    revalidatePath("/admin");
    return professional;
}

export async function applyForProfessional(data: {
    headline: string;
    bio: string;
    languages: any;
    pricePerMinute: number;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) throw new Error("Unauthorized");

    const profile = await prisma.professional.create({
        data: {
            userId: session.user.id,
            headline: data.headline,
            bio: data.bio,
            languages: data.languages,
            pricePerMinute: data.pricePerMinute,
            currency: "USD",
            isVerified: false // Default to false
        }
    });
    
    revalidatePath("/pro");
    return profile;
}
