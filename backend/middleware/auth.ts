import passport from "passport";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  UNAUTHORIZED,
  LOGGED_IN,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
} from "../utils/constants";
import APIError from "../utils/APIError";
import { NextFunction, Request, Response } from "express";
import { Roles } from "@prisma/client";
import { JWT_SECRET } from "../config/env";

const getPayload = (req: Request): JwtPayload | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET!) as JwtPayload;
  } catch (error: any) {
    return null;
  }
};

const handleJWT =
  (req: Request, res: Response, next: NextFunction, roles: Roles[]) =>
  async (
    err: { message: string; stack?: string } | null,
    user: any,
    info: { message: string; stack?: string } | null
  ) => {
    const error = err || info;
    const apiError = new APIError({
      message: error ? error.message : "Unauthorized",
      status: UNAUTHORIZED,
      stack: (error && error.stack) || "Unauthorized",
    });

    const payload = getPayload(req);
    if (!payload || !payload.sub) return next(apiError);

    if (!roles.includes(payload.role)) return next(apiError);

    req.user = payload.sub;
    return next();
  };

export const Authorize =
  (roles: Roles[] = ["USER"]) =>
  (req: Request, res: Response, next: NextFunction) =>
    passport.authenticate(
      "jwt",
      {
        session: false,
      },
      handleJWT(req, res, next, roles)
    )(req, res, next);

export const OptionalAuthorize =
  () => (req: Request, res: Response, next: NextFunction) => {
    const auth = req.header("Authorization");
    if (auth) {
      passport.authenticate(
        "jwt",
        {
          session: false,
        },
        handleJWT(req, res, next, ["USER"])
      )(req, res, next);
    } else {
      next();
    }
  };

// export const generateTokenResponse = (admin, accessToken) => {
//   const tokenType = "Bearer";
//   const refreshToken = RefreshToken.generate(admin);
//   const expiresIn = moment().add(jwtExpirationInterval, "minutes");
//   return {
//     tokenType,
//     accessToken,
//     refreshToken,
//     expiresIn,
//   };
// };
