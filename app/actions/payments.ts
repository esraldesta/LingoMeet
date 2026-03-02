"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  createConnectOnboardingLink,
  refreshConnectAccountCapabilities,
} from "@/lib/services/stripeService";

function getAppBaseUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured");
  }
  return base.replace(/\/$/, "");
}

export async function getStripeOnboardingLinkForCurrentProfessional() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });

  if (!professional) {
    throw new Error("Professional profile not found");
  }

  const appUrl = getAppBaseUrl();

  const { url } = await createConnectOnboardingLink({
    professionalId: professional.id,
    refreshUrl: `${appUrl}/pro/profile?stripe=refresh`,
    returnUrl: `${appUrl}/pro/profile?stripe=return`,
  });

  return { url };
}

export async function refreshCurrentProfessionalStripeAccount() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });

  if (!professional) {
    throw new Error("Professional profile not found");
  }

  const updated = await refreshConnectAccountCapabilities(professional.id);
  return updated;
}

