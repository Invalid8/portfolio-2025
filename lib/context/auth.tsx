"use client";

// Thin shim over @dalgoridim/headless-cms. Supplies the portfolio's Firebase
// auth instance to the package's FirebaseAuthProvider and re-exports its hook as
// `useAuth` so existing call sites keep working unchanged.
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  FirebaseAuthProvider,
  useFirebaseAuth,
} from "@dalgoridim/headless-cms/auth/firebase/client";
import { auth, googleProvider } from "@/lib/firebase/config";
import { ADMIN_LOGIN_ROUTE } from "../constants";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <FirebaseAuthProvider
      auth={auth}
      googleProvider={googleProvider}
      onLogout={() => router.push(ADMIN_LOGIN_ROUTE)}
    >
      {children}
    </FirebaseAuthProvider>
  );
}

export const useAuth = useFirebaseAuth;
