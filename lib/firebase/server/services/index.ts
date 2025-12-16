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

export async function createDocument<T>(
  collectionName: string,
  data: T
): Promise<T & { id: string }> {
  const ref = db.collection(collectionName).doc();

  await ref.set({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    id: ref.id,
    ...(data as T),
  };
}

export async function createDocumentWithId<T>(
  collectionName: string,
  id: string,
  data: T
): Promise<T & { id: string }> {
  await db
    .collection(collectionName)
    .doc(id)
    .set({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  return { id, ...(data as T) };
}

export async function updateDocument<T extends object>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  await db
    .collection(collectionName)
    .doc(id)
    .update({
      ...data,
      updatedAt: new Date(),
    });
}

export async function upsertDocument<T extends object>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  await db
    .collection(collectionName)
    .doc(id)
    .set(
      {
        ...data,
        updatedAt: new Date(),
      },
      { merge: true }
    );
}

export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  await db.collection(collectionName).doc(id).delete();
}
