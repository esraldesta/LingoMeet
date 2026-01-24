import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProIndexPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/pro-signin");
  }

  // Check user role first - simplest check
  if (session.user.role === "pro") {
      redirect("/pro/dashboard");
  }
  
  // If not role pro, check if they have a professional record
  const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
  });

  if (!professional) {
      // If they are logged in but don't have a profile, they likely signed up as a learner.
      // Redirect them to a page to complete their profile (which was apply, but now part of signup flow).
      // Since the user wants "instead of pro/apply", we can redirect them to a dedicated "upgrade" or "onboarding" page.
      // Or we can repurpose the Apply page but route it differently.
      // For now, let's redirect them to the signup page - IF they can see the form? 
      // Signup page expects to create an account.
      
      // Let's stick to /pro/apply for existing users but maybe we should have renamed it.
      // But based on "Instead of pro/apply", I should assume the signup is the main entry.
      // If a logged-in user hits this, let's redirect to /pro/apply for now to avoid broken flow, 
      // but the "Pro Portal" concept implies they should have used the pro-signup.
      redirect("/pro/apply");
  }

  
  // Fallback (e.g. verified but role not updated for some reason)
  redirect("/pro/dashboard");
}
