import { NextRequest, NextResponse } from "next/server";
import { firebaseAdmin, db } from "@/lib/firebase/server/admin";

const MAX_SHARES = 10;

async function verifyToken(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    return await firebaseAdmin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const decoded = await verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db
    .collection("shared-notes")
    .where("ownerId", "==", decoded.uid)
    .get();

  if (existing.size >= MAX_SHARES) {
    return NextResponse.json(
      { error: "Share limit reached", limit: MAX_SHARES },
      { status: 403 },
    );
  }

  const body = await req.json();
  const { title, html, fontSize } = body;

  if (!title || !html) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const ref = db.collection("shared-notes").doc();

  await ref.set({
    shareId: ref.id,
    ownerId: decoded.uid,
    ownerEmail: decoded.email ?? "",
    title,
    html,
    fontSize: fontSize ?? 20,
    createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ shareId: ref.id });
}

export async function GET(req: NextRequest) {
  const decoded = await verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snap = await db
    .collection("shared-notes")
    .where("ownerId", "==", decoded.uid)
    .orderBy("createdAt", "desc")
    .get();

  const shares = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      shareId: doc.id,
      title: d.title,
      createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    };
  });

  return NextResponse.json({ shares, remaining: MAX_SHARES - snap.size });
}