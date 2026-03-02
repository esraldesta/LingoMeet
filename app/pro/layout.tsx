import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import ProHeader from "./_components/ProHeader";

export default async function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // Not logged in
    if (!session) {
        return redirect("/auth/signin")
    }

    // Not a pro user
    if (session.user.role !== "pro") {
        return redirect("/auth/signin?message=you need to login as professional to access the professional pages") // or redirect somewhere else
    }

    return (
        <div className="min-h-screen">
            <ProHeader />
            {children}
        </div>
    )
}