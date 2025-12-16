import {
  createDocument,
  createDocumentWithId,
} from "@/lib/firebase/server/services";
import { requireAdmin } from "@/lib/firebase/server/services/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { collection: string } }
) {
  await requireAdmin();

  const body = await req.json();
  const { id, ...data } = body;

  const result = id
    ? await createDocumentWithId(params.collection, id, data)
    : await createDocument(params.collection, data);

  return NextResponse.json(result);
}
