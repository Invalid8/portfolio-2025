const DB_NAME = "scribble-notes";
const DB_VERSION = 1;
const STORE = "notes";

export type NoteTab = {
  id: string;
  title: string;
  html: string;
  createdAt: number;
  updatedAt: number;
};

export type Note = {
  id: string;
  slug: string;
  title: string;
  fontSize: number;
  tabs: NoteTab[];
  activeTabId: string;
  createdAt: number;
  updatedAt: number;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("slug", "slug", { unique: true });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, "readonly");
    const store = t.objectStore(STORE);
    const index = store.index("updatedAt");
    const req = index.getAll();
    req.onsuccess = () => resolve((req.result as Note[]).reverse());
    req.onerror = () => reject(req.error);
  });
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, "readonly");
    const store = t.objectStore(STORE);
    const index = store.index("slug");
    const req = index.get(slug);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function getNoteById(id: string): Promise<Note | null> {
  const db = await openDB();
  const result = await tx(db, "readonly", (s) => s.get(id));
  return (result as Note) ?? null;
}

export async function saveNote(note: Note): Promise<void> {
  const db = await openDB();
  await tx(db, "readwrite", (s) => s.put(note));
}

export async function deleteNote(id: string): Promise<void> {
  const db = await openDB();
  await tx(db, "readwrite", (s) => s.delete(id));
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "untitled";
}

export function makeNewNote(title = "Untitled"): Note {
  const now = Date.now();
  const tabId = makeId();
  return {
    id: makeId(),
    slug: slugify(title) + "-" + Math.random().toString(36).slice(2, 6),
    title,
    fontSize: 20,
    tabs: [{ id: tabId, title: "Page 1", html: "", createdAt: now, updatedAt: now }],
    activeTabId: tabId,
    createdAt: now,
    updatedAt: now,
  };
}