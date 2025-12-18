/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Section {
  id: string;
  collection: string;
  [key: string]: any;
}

interface PageContextType {
  sections: Record<string, Section>;
  setSection: (key: string, section: Section) => void;
  editField: (sectionKey: string, fieldKey: string, value: any) => void;
  saveSection: (sectionKey: string) => Promise<void>;
  saveAll: () => Promise<void>;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider = ({ children }: { children: ReactNode }) => {
  const [sections, setSections] = useState<Record<string, Section>>({});

  const setSection = (key: string, section: Section) => {
    setSections((prev) => ({ ...prev, [key]: section }));
  };

  const editField = (sectionKey: string, fieldKey: string, value: any) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [fieldKey]: value },
    }));
  };

  const saveSection = async (sectionKey: string) => {
    const section = sections[sectionKey];
    if (!section?.id || !section?.collection) return;

    try {
      await fetch(`/api/admin/firebase/${section.collection}/${section.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(section),
      });
    } catch (err) {
      console.error(`Failed to save section ${sectionKey}`, err);
    }
  };

  const saveAll = async () => {
    const keys = Object.keys(sections);
    for (const key of keys) {
      await saveSection(key);
    }
  };

  return (
    <PageContext.Provider
      value={{ sections, setSection, editField, saveSection, saveAll }}
    >
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context)
    throw new Error("usePageContext must be used within a PageProvider");
  return context;
};
