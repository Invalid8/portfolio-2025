import {
  updateDocument,
  upsertDocument,
  deleteDocument,
} from "@/lib/firebase/server/services";
import { requireAdmin } from "@/lib/firebase/server/services/auth";
import { serializeFirestoreData } from "@/lib/serialize";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> },
) {
  await requireAdmin();

  const { collection, id } = await context.params;
  const data = serializeFirestoreData(await request.json());
  await updateDocument(collection, id, data);

  return NextResponse.json({ ok: true });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> },
) {
  await requireAdmin();

  const { collection, id } = await context.params;
  const data = serializeFirestoreData(await request.json());
  await upsertDocument(collection, id, data);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> },
) {
  await requireAdmin();

  const { collection, id } = await context.params;
  await deleteDocument(collection, id);

  return NextResponse.json({ ok: true });
}
