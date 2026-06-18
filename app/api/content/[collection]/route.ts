import { getDataAdapter } from "@/lib/cms/server";
import { NextResponse } from "next/server";

// Public, read-only collection endpoint so client components can load CMS content
// through the configured backend (Firebase or Postgres) — never the DB directly.
export async function GET(
  _request: Request,
  context: { params: Promise<{ collection: string }> },
) {
  try {
    const { collection } = await context.params;
    const docs = await getDataAdapter().fetchCollection(collection);
    return NextResponse.json(docs, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Failed to fetch content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 },
    );
  }
}
