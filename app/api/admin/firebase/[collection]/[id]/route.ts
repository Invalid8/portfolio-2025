/* eslint-disable @typescript-eslint/no-explicit-any */
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
  context: { params: { collection: string; id: string } },
) {
  await requireAdmin();

  const data = serializeFirestoreData(await request.json());
  await updateDocument(context.params.collection, context.params.id, data);

  return NextResponse.json({ ok: true });
}

export async function PUT(
  request: NextRequest,
  context: { params: { collection: string; id: string } },
) {
  await requireAdmin();

  const data = serializeFirestoreData(await request.json());
  await upsertDocument(context.params.collection, context.params.id, data);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  context: { params: { collection: string; id: string } },
) {
  await requireAdmin();

  await deleteDocument(context.params.collection, context.params.id);

  return NextResponse.json({ ok: true });
}
