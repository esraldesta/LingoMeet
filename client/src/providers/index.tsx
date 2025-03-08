import { RoomProvider } from "@/context/room-context";
import { ReactElement } from "react";

export function Providers({ children }: { children: ReactElement }) {
  return <RoomProvider>{children}</RoomProvider>;
}
