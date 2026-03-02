import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Header from "@/app/home/_components/Header";

export default async function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return redirect("/auth/signin")

    if (session.user.role !== "user") {
        return redirect("/auth/signin?message=please use student account to access the student pages")
    }
    return (
        <div className="min-h-screen">
            <Header />
            {children}
        </div>
    )
}