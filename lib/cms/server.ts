import "server-only";
import type { DataAdapter, AuthAdapter } from "@dalgoridim/headless-cms/server";
import { createAdminGate } from "@dalgoridim/headless-cms/server";
import { FirestoreDataAdapter } from "@dalgoridim/headless-cms/adapters/firestore";
import { firebaseAuth } from "@dalgoridim/headless-cms/auth/firebase";
import { db } from "@/lib/firebase/server/admin";

let _data: DataAdapter | null = null;

export function getDataAdapter(): DataAdapter {
  if (_data) return _data;
  _data = new FirestoreDataAdapter({ db });
  return _data;
}

/** Shared server-side admin gate, reused by every admin route. */
export const cmsAuth: AuthAdapter = firebaseAuth({
  adminEmails: process.env.ADMIN_EMAILS?.split(",") ?? [],
});

export const requireAdmin = createAdminGate(cmsAuth);
