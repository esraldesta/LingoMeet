import { Suspense } from "react";
import AlreadyConnectedClient from "./AlreadyConnectedClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <AlreadyConnectedClient />
    </Suspense>
  );
}

