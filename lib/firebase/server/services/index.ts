import { Query } from "firebase-admin/firestore";
import { db } from "../admin";

export async function fetchCollectionServer<T>(
  collectionName: string,
  q?: Query
): Promise<(T & { id: string })[]> {
  const snap = q ? await q.get() : await db.collection(collectionName).get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as T),
  }));
}

export async function fetchByIdServer<T>(
  collection: string,
  id: string
): Promise<(T & { id: string }) | null> {
  const doc = await db.collection(collection).doc(id).get();

  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...(doc.data() as T),
  };
}
