import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin, pro, user } from "@/components/auth/permissions";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5 // 5 min
        },
    },
    rateLimit: {
        storage: "database",
    },
    // socialProviders: {
    //     github: {
    //         clientId: process.env.GITHUB_CLIENT_ID as string,
    //         clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    //     },
    // },
    plugins: [
        adminPlugin({
            ac,
            roles: {
                admin,
                pro,
                user
            }
        }),
        nextCookies()] // make sure nextCookies is the last plugin in the array

});