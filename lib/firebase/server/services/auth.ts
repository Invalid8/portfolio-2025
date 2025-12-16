import admin from "firebase-admin";
import { cookies } from "next/headers";


export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;

  if (!token) throw new Error("Unauthorized");

  const decoded = await admin.auth().verifyIdToken(token);
  if (!decoded.admin) throw new Error("Forbidden");

  return decoded;
}