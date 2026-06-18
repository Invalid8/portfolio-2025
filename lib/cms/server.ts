import "server-only";
import type { DataAdapter, AuthAdapter } from "@dalgoridim/headless-cms/server";
import { createAdminGate } from "@dalgoridim/headless-cms/server";
import { FirestoreDataAdapter } from "@dalgoridim/headless-cms/adapters/firestore";
import { PostgresDataAdapter } from "@dalgoridim/headless-cms/adapters/postgres";
import { firebaseAuth } from "@dalgoridim/headless-cms/auth/firebase";
import { db } from "@/lib/firebase/server/admin";

/**
 * Central CMS backend configuration. One switch — `DATA_BACKEND` — selects the
 * data store for the ENTIRE app (reads, writes, server + client-via-API).
 *
 *   DATA_BACKEND=postgres  + DATABASE_URL=...   → Postgres
 *   (unset / anything else)                     → Firebase (default)
 *
 * Auth always stays Firebase, independent of the data backend.
 */
export const isPostgres = () => process.env.DATA_BACKEND === "postgres";

let _data: DataAdapter | null = null;

export function getDataAdapter(): DataAdapter {
  if (_data) return _data;
  _data = isPostgres()
    ? new PostgresDataAdapter({ connectionString: process.env.DATABASE_URL })
    : new FirestoreDataAdapter({ db });
  return _data;
}

/** Shared server-side admin gate, reused by every admin route. */
export const cmsAuth: AuthAdapter = firebaseAuth({
  adminEmails: process.env.ADMIN_EMAILS?.split(",") ?? [],
});

export const requireAdmin = createAdminGate(cmsAuth);
