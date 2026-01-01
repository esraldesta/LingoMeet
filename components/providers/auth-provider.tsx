"use client";

import { createAuthClient } from "better-auth/react";
import { createContext, useContext, ReactNode } from "react";
import { adminClient } from "better-auth/client/plugins"

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
        adminClient()
    ]
});

const AuthContext = createContext(authClient);

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={authClient}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
