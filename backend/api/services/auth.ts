import { PrismaClient, Providers, User } from "@prisma/client";
import { SignUpGoogleDTO } from "../../types/auth";

const prisma = new PrismaClient();

export const sign_in_up_google = async (
  data: SignUpGoogleDTO
): Promise<User> => {
  const { email, family_name, given_name, clientId } = data;
  const existing_user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (existing_user && !clientId) {
    throw new Error("Invalid Request!");
  }

  if (existing_user) {
    return existing_user;
  }

  const user = await prisma.user.create({
    data: {
      email: email,
      lastName: family_name,
      firstName: given_name,
    },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      provider: Providers.GOOGLE,
      providerId: data.clientId,
    },
  });

  return user;
};
