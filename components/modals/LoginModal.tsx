"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/context/auth";
import { Google } from "../svgs";
import { LogOutIcon, UserIcon } from "lucide-react";

export function LoginModal() {
  const { user, loginWithGoogle, loginWithEmail, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (user) {
    return (
      <div className="flex flex-col gap-4 right-8 top-60 fixed z-9999 ">
        <button
          className="flex items-center gap-2 text-red-500 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOutIcon />
        </button>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="right-8 bottom-60 fixed z-9999 cursor-pointer">
          <UserIcon />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl pb-2">Login</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {error && <p className="text-red-500">{error}</p>}

          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleEmailLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login with Email"}
          </Button>

          <div className="flex items-center gap-2">
            <span className="flex-1 border-t" />
            <span>or</span>
            <span className="flex-1 border-t" />
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="bg-black text-white"
          >
            <Google />
            {loading ? "Processing..." : "Login with Google"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
