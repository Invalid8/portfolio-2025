import admin from "firebase-admin";
import { cookies } from "next/headers";

const ALLOWED_ADMIN_EMAILS =
  process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;

  if (!token) throw new Error("Unauthorized");

  const decoded = await admin.auth().verifyIdToken(token);

  if (!decoded.admin || !ALLOWED_ADMIN_EMAILS.includes(decoded.email || "")) {
    throw new Error("Forbidden - Not an authorized admin");
  }

  return decoded;
}
