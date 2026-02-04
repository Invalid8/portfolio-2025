import {
  createDocument,
  createDocumentWithId,
} from "@/lib/firebase/server/services";
import { requireAdmin } from "@/lib/firebase/server/services/auth";
import { serializeFirestoreData } from "@/lib/serialize";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: { collection: string } },
) {
  await requireAdmin();

  const body = await request.json();
  const { id, ...data } = serializeFirestoreData(body);

  const result = id
    ? await createDocumentWithId(context.params.collection, id, data)
    : await createDocument(context.params.collection, data);

  return NextResponse.json(result);
}
