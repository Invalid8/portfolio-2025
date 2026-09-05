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
import type { Item, ItemMap } from "@/types";

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

// better-content types item fields as `unknown`; the portfolio's own `Item`
// keeps them loose, so call sites can read `section.skills` without narrowing
// every access. The values are identical at runtime, only the view differs.
type PortfolioPageContext = Omit<PageContextValue, "items" | "getItem"> & {
  items: ItemMap;
  getItem: (collection: string, id: string) => Item | undefined;
};

export function usePageContext(): PortfolioPageContext {
  return useCmsPageContext() as unknown as PortfolioPageContext;
}

export type { PendingImage } from "better-content/react";
