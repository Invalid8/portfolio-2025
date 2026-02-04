import { PageProvider } from "@/lib/context/PageContent";
import { SurpriseUIProvider } from "@/lib/context/suprise-props";
import Navbar from "./_components/Navbar";
import { ReactNode } from "react";
import Footer from "./_components/Footer";
import Toolkit from "./_components/Toolkit";

function layout({ children }: { children: ReactNode }) {
  return (
    <PageProvider>
      <SurpriseUIProvider>
        <Navbar />
        {children}
        <Footer />
        <Toolkit />
      </SurpriseUIProvider>
    </PageProvider>
  );
}

export default layout;
