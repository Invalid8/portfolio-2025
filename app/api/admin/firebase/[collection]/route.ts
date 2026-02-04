import {
  createDocument,
  createDocumentWithId,
} from "@/lib/firebase/server/services";
import { requireAdmin } from "@/lib/firebase/server/services/auth";
import { serializeFirestoreData } from "@/lib/serialize";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ collection: string }> },
) {
  try {
    await requireAdmin();

    const { collection } = await context.params;
    const body = await request.json();
    const { id, ...data } = serializeFirestoreData(body);

    const result = id
      ? await createDocumentWithId(collection, id, data)
      : await createDocument(collection, data);

    return NextResponse.json(result);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/argument-error" ||
      error.message === "Unauthorized"
    ) {
      return NextResponse.json(
        { error: "Unauthorized", logout: true },
        { status: 401 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
