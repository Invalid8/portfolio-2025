import "server-only";
import type { DataAdapter, AuthAdapter } from "better-content/server";
import { FirestoreDataAdapter } from "better-content/adapters/firestore";
import { firebaseAuth } from "better-content/auth/firebase";
import { db } from "@/lib/firebase/server/admin";

let _data: DataAdapter | null = null;

export function getDataAdapter(): DataAdapter {
  if (_data) return _data;
  _data = new FirestoreDataAdapter({ db });
  return _data;
}

/** Shared auth adapter; createCmsHandlers builds its own gate from it. */
export const cmsAuth: AuthAdapter = firebaseAuth({
  adminEmails: process.env.ADMIN_EMAILS?.split(",") ?? [],
});
