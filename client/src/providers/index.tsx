import { queryClient } from "@/api/react-query";
import { RoomProvider } from "@/context/room-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactElement } from "react";

export function Providers({ children }: { children: ReactElement }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      <RoomProvider>{children}</RoomProvider>;
    </QueryClientProvider>
  );
}
