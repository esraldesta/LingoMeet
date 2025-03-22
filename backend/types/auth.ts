import { Roles } from "@prisma/client";

export interface SignUpGoogleDTO {
  email: string;
  given_name: string;
  family_name?: string;
  clientId: string;
}

declare module "jsonwebtoken" {
  interface JwtPayload {
    sub?: string | undefined;
    role: Roles;
  }
}
