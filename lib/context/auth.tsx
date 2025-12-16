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
import { LoginModal } from "@/components/modals/LoginModal";

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        const tokenResult = await u.getIdTokenResult();
        setIsAdmin(!!tokenResult.claims.admin);

        setCookie("adminToken", tokenResult.token, { path: "/" });
      } else {
        setUser(null);
        setIsAdmin(false);
        deleteCookie("adminToken", { path: "/" });
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    setUser(result.user);
    const tokenResult = await result.user.getIdTokenResult();
    setIsAdmin(!!tokenResult.claims.admin);
    setCookie("adminToken", tokenResult.token, { path: "/" });
  };

  const loginWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    setUser(result.user);
    const tokenResult = await result.user.getIdTokenResult();
    setIsAdmin(!!tokenResult.claims.admin);
    setCookie("adminToken", tokenResult.token, { path: "/" });
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
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
       <LoginModal />
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
