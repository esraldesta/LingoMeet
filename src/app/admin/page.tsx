import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { auth } from "@/lib/auth"
import { ArrowLeft, Users, GraduationCap } from "lucide-react";
import { headers } from "next/headers"
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserRow } from "./_components/UserRow";
import { getPendingProfessionals } from "@/app/actions/professional";
import { ApproveProButton } from "./_components/ApproveProButton";

export default async function AdminPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return redirect("/auth/signin")

    const hasAdminAccess = await auth.api.userHasPermission({
        headers: await headers(),
        body: {
            permission: {
                user: ["list"]
            }
        }
    })

    console.log("hasAdminAccess",hasAdminAccess);
    
    if (!hasAdminAccess.success) {
        return redirect("/")
    }

    const { total, users } = await auth.api.listUsers({
        headers: await headers(),
        query: {
            limit: 10
        }
    })

    const pendingPros = await getPendingProfessionals();

    return (
        <div className="mx-auto container my-6 px-4 space-y-8">
            <Link href="/" className="inline-flex items-center">
                <ArrowLeft className="size-4 mr-2" />
                Back to Home
            </Link>

            {/* Pending Approvals Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-yellow-600" />
                        Pending Professional Approvals ({pendingPros.length})
                    </CardTitle>
                    <CardDescription>
                        Review and approve user applications to become Language Professionals
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingPros.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Headline</TableHead>
                                        <TableHead>Applied On</TableHead>
                                        <TableHead className="w-25">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingPros.map(pro => (
                                        <TableRow key={pro.id}>
                                            <TableCell>
                                                <div className="font-medium">{pro.user.name}</div>
                                                <div className="text-sm text-muted-foreground">{pro.user.email}</div>
                                            </TableCell>
                                            <TableCell>{pro.headline}</TableCell>
                                            <TableCell>{new Date(pro.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <ApproveProButton professionalId={pro.id} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm italic py-4 text-center">No pending approvals.</p>
                    )}
                </CardContent>
            </Card>

            {/* Users Management Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Users ({total})
                    </CardTitle>
                    <CardDescription>
                        Manage user accounts, roles, and permissions
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-25">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    users.map(user => (
                                        <UserRow key={user.id} user={user} selfId={session.user.id} />
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>

            </Card>
        </div>
    )
}
