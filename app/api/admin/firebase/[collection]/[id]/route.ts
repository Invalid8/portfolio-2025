import { createCmsHandlers } from "better-content/server";
import { getDataAdapter, cmsAuth } from "@/lib/cms/server";

// Data backend follows DATA_BACKEND; auth is the shared Firebase gate.
export const { GET, PATCH, PUT, DELETE } = createCmsHandlers({
  data: getDataAdapter(),
  auth: cmsAuth,
});
