"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth, googleProvider } from "@/lib/firebase/config";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { setCookie, deleteCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ADMIN_LOGIN_ROUTE } from "../constants";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isEditing: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleEdit: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        const tokenResult = await u.getIdTokenResult();
        const admin = !!tokenResult.claims.admin;

        if (!admin) {
          toast.error(
            "You do not have admin privileges. Please contact the site owner.",
          );
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
          deleteCookie("adminToken", { path: "/" });
          return;
        }

        setIsAdmin(admin);
        setCookie("adminToken", tokenResult.token, { path: "/" });

        if (pathname.startsWith(ADMIN_LOGIN_ROUTE)) {
          router.replace("/");
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        deleteCookie("adminToken", { path: "/" });
      }
    });
    return () => unsubscribe();
  }, [router, pathname]);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      try {
        const response = await originalFetch(...args);

        if (response.status === 401) {
          try {
            const data = await response.clone().json();
            if (data.logout) {
              toast.error("Session expired. Please login again.");
              await signOut(auth);
              setUser(null);
              setIsAdmin(false);
              setIsEditing(false);
              deleteCookie("adminToken", { path: "/" });
              router.push(ADMIN_LOGIN_ROUTE);
            }
          } catch (e) {
            console.error("Error parsing 401 response:", e);
          }
        }

        return response;
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const tokenResult = await result.user.getIdTokenResult();

    if (!tokenResult.claims.admin) {
      toast.error(
        "You do not have admin privileges. Please contact the site owner.",
      );
      await signOut(auth);
      throw new Error("Unauthorized");
    }

    setUser(result.user);
    setIsAdmin(true);
    setCookie("adminToken", tokenResult.token, { path: "/" });
  };

  const loginWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const tokenResult = await result.user.getIdTokenResult();

    if (!tokenResult.claims.admin) {
      toast.error(
        "You do not have admin privileges. Please contact the site owner.",
      );
      await signOut(auth);
      throw new Error("Unauthorized");
    }

    setUser(result.user);
    setIsAdmin(true);
    setCookie("adminToken", tokenResult.token, { path: "/" });
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
    setIsEditing(false);
    deleteCookie("adminToken", { path: "/" });
  };

  const toggleEdit = () => setIsEditing((prev) => !prev);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isEditing,
        loginWithGoogle,
        loginWithEmail,
        logout,
        toggleEdit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};