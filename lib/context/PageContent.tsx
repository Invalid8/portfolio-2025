"use client";

// Portfolio shim over better-content: injects Cloudinary storage and the REST
// transport pointed at the admin API, re-exports usePageContext.
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  PageProvider as CmsPageProvider,
  usePageContext as useCmsPageContext,
  type Notifier,
  type PageContextValue,
} from "better-content/react";
import { restTransport } from "better-content/core";
import { cloudinaryStorage } from "better-content/storage/cloudinary";
import type { ItemMap } from "@/types";

const storage = cloudinaryStorage({
  folder: "portfolio",
  signEndpoint: "/api/admin/cloudinary/sign",
});

const transport = restTransport({ apiBasePath: "/api/admin/firebase" });

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
      transport={transport}
      storage={storage}
      notify={notify}
    >
      {children}
    </CmsPageProvider>
  );
}

export function usePageContext(): PageContextValue {
  return useCmsPageContext();
}

export type { PendingImage } from "better-content/react";
