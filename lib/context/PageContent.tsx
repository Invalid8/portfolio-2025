"use client";

// Portfolio shim over @dalgoridim/headless-cms: injects Cloudinary storage and
// the admin API base path, re-exports usePageContext.
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  PageProvider as CmsPageProvider,
  usePageContext,
  type Notifier,
} from "@dalgoridim/headless-cms/client";
import { cloudinaryStorage } from "@dalgoridim/headless-cms/storage/cloudinary";
import type { ItemMap } from "@/types";

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
  initialItems = {},
}: {
  children: ReactNode;
  initialItems?: ItemMap;
}) {
  return (
    <CmsPageProvider
      initialItems={initialItems}
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
