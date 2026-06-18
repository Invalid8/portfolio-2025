import { UnauthorizedError } from "@dalgoridim/headless-cms/server";
import { getDataAdapter, requireAdmin } from "@/lib/cms/server";
import { NextRequest, NextResponse } from "next/server";

// Collection-level create. Data backend follows DATA_BACKEND; auth is the shared
// Firebase gate. (Per-document GET/PATCH/PUT/DELETE live in [id]/route.ts.)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ collection: string }> },
) {
  try {
    await requireAdmin(request);

    const { collection } = await context.params;
    const { id, ...data } = await request.json();
    const data_ = getDataAdapter();

    const result = id
      ? await data_.createWithId(collection, id, data)
      : await data_.create(collection, data);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UnauthorizedError && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized", logout: true },
        { status: 401 },
      );
    }
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
