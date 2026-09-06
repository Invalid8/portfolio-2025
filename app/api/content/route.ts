import { createContentHandler } from "better-content/server";
import { getDataAdapter } from "@/lib/cms/server";
import { CONTENT_COLLECTIONS } from "@/lib/cms/collections";

// Public, read-only snapshot of the site's content: the same ItemMap the
// server layout loads, for anything that needs it on the client.
//
// This replaced a hand-rolled `/api/content/[collection]` route that took the
// collection name from the URL and returned every document in it. That let an
// unauthenticated caller read any Firestore collection, `shared-notes`
// included, which carries note bodies and owner emails. The collections here
// are a fixed allowlist, so the route can only return site content.
export const { GET } = createContentHandler({
  data: getDataAdapter(),
  collections: CONTENT_COLLECTIONS,
});
