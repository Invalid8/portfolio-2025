import { NextRequest, NextResponse } from "next/server";
import { firebaseAdmin, db } from "@/lib/firebase/server/admin";

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

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ shareId: string }> },
) {
  const decoded = await verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { shareId } = await context.params;
  const ref = db.collection("shared-notes").doc(shareId);
  const snap = await ref.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (snap.data()?.ownerId !== decoded.uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ref.delete();
  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ shareId: string }> },
) {
  const { shareId } = await context.params;
  const snap = await db.collection("shared-notes").doc(shareId).get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const d = snap.data()!;

  return NextResponse.json({
    shareId: snap.id,
    title: d.title,
    html: d.html,
    fontSize: d.fontSize,
    ownerEmail: d.ownerEmail,
    createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
  });
}