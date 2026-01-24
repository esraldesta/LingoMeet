import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { ac, admin, pro, user } from "@/components/auth/permissions"

export const authClient = createAuthClient({
    baseURL: "https://lingo-meet.vercel.app",
    // baseURL: "http://localhost:3000",
    plugins: [
        adminClient({
            ac,
            roles: {
                admin,
                pro,
                user
            }
        })
    ]
})