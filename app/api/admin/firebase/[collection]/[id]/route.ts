import {
  updateDocument,
  upsertDocument,
  deleteDocument,
} from "@/lib/firebase/server/services";
import { requireAdmin } from "@/lib/firebase/server/services/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { collection: string; id: string } }
) {
  await requireAdmin();

  const data = await req.json();
  await updateDocument(params.collection, params.id, data);

  return NextResponse.json({ ok: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { collection: string; id: string } }
) {
  await requireAdmin();

  const data = await req.json();
  await upsertDocument(params.collection, params.id, data);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { collection: string; id: string } }
) {
  await requireAdmin();

  await deleteDocument(params.collection, params.id);

  return NextResponse.json({ ok: true });
}
