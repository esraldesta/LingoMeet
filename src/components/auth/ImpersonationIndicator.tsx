"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { UserX } from "lucide-react"

export function ImpersonationIndicator(){
    const router = useRouter()
    const { data: session, refetch } = authClient.useSession()
    if (session?.session.impersonatedBy == null) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <Button size={"sm"} variant={"destructive"} onClick={()=>{
                authClient.admin.stopImpersonating(undefined,{
                    onSuccess:()=>{
                        router.push("/admin")
                        refetch()
                    }
                })
            }}>

            <UserX className="size-4"/>
            </Button>
        </div>
    )
}