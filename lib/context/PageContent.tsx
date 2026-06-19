"use client";

// Thin shim over @dalgoridim/headless-cms. Keeps the app's import path stable
// while delegating the engine to the package. Injects the portfolio's storage
// (Cloudinary, signed by the existing /api/admin/cloudinary/sign route) and the
// existing admin API base path.
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  PageProvider as CmsPageProvider,
  usePageContext,
  type Notifier,
} from "@dalgoridim/headless-cms/client";
import { cloudinaryStorage } from "@dalgoridim/headless-cms/storage/cloudinary";
import type { NestedSections } from "@/types";

const storage = cloudinaryStorage({
  folder: "portfolio",
  signEndpoint: "/api/admin/cloudinary/sign",
});

const notify: Notifier = {
  success: (m) => toast.success(m),
  error: (m) => toast.error(m),
};

export function PageProvider({
  children,
  initialSections = {},
}: {
  children: ReactNode;
  initialSections?: NestedSections;
}) {
  return (
    <CmsPageProvider
      initialSections={initialSections}
      apiBasePath="/api/admin/firebase"
      storage={storage}
      notify={notify}
    >
      {children}
    </CmsPageProvider>
  );
}

export { usePageContext };
export type { PendingImage } from "@dalgoridim/headless-cms/client";
