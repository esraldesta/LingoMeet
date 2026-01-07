"use client"

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch //refetch the session
  } = authClient.useSession()
  const [hasAdminAccess, setHasAdminAccess] = useState(false)

  useEffect(() => {
    authClient.admin.hasPermission({
      permission: {
        user: [
          "list"
        ]
      }
    }).then(({ data }) => {
      setHasAdminAccess(data?.success || false)
    })
  }, [])

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    )
  }
  

  return (
    <div className="min-h-screen font-sans">
      <div className="w-full flex flex-col justify-center items-center my-5 text-2xl">
          welcome {session?.user && session.user.name}

        {
          session?.user ? (
            <div className="w-full flex justify-center gap-2 mt-3">

              {
                hasAdminAccess &&
                <Button asChild variant={"outline"}>
                  <Link href="/admin">Admin</Link>
                </Button>
              }


              <Button onClick={() => {
                authClient.signOut()
              }}>
                Logout
              </Button>
            </div>
          ) :
            <div className="flex gap-3 mt-5">
              <Button asChild>
                <Link href="/auth/signin">Get started</Link>
              </Button>
            </div>
        }
      </div>


    </div>
  );
}
