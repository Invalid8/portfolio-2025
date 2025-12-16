import {
  collection,
  getDocs,
  Query,
  query as buildQuery,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../config";

export async function fetchCollectionClient<T>(
  collectionName: string,
  q?: Query
): Promise<(T & { id: string })[]> {
  const baseCollection = collection(db, collectionName);

  const snap = q ? await getDocs(q) : await getDocs(buildQuery(baseCollection));

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as T),
  }));
}

export async function fetchByIdClient<T>(
  collectionName: string,
  id: string
): Promise<(T & { id: string }) | null> {
  const snap = await getDoc(doc(db, collectionName, id));

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as T),
  };
}
