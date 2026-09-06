import { PageProvider } from "@/lib/context/PageContent";
import { SurpriseUIProvider } from "@/lib/context/suprise-props";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import Toolkit from "./_components/Toolkit";
import { getDataAdapter } from "@/lib/cms/server";
import { loadItemMap } from "better-content/server";
import { ReactNode } from "react";
import type { ItemMap } from "@/types";
import { CONTENT_COLLECTIONS } from "@/lib/cms/collections";

export default async function Layout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: React.ReactNode;
}) {
  let initialItems: ItemMap = {};

  try {
    initialItems = await loadItemMap(getDataAdapter(), CONTENT_COLLECTIONS);
  } catch (err) {
    console.error("Failed to load layout data:", err);
  }

  return (
    <PageProvider initialItems={initialItems}>
      <SurpriseUIProvider>
        <Navbar />
        {children}
        <Footer />
        <Toolkit />
      </SurpriseUIProvider>
      {modal}
    </PageProvider>
  );
}
