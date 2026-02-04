/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface Section {
  id: string;
  collection: string;
  [key: string]: any;
}

interface PageContextType {
  sections: Record<string, Section>;
  hasUnsavedChanges: boolean;
  setSection: (key: string, section: Section) => void;
  editField: (sectionKey: string, fieldKey: string, value: any) => void;
  saveSection: (sectionKey: string) => Promise<void>;
  saveAll: () => Promise<void>;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider = ({ children }: { children: ReactNode }) => {
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const setSection = useCallback((key: string, section: Section) => {
    setSections((prev) => ({ ...prev, [key]: section }));
  }, []);

  const editField = useCallback(
    (sectionKey: string, fieldKey: string, value: any) => {
      setSections((prev) => ({
        ...prev,
        [sectionKey]: { ...prev[sectionKey], [fieldKey]: value },
      }));
      setHasUnsavedChanges(true);
    },
    [],
  );

  const saveSection = useCallback(async (sectionKey: string) => {
    setSections((currentSections) => {
      const section = currentSections[sectionKey];
      if (!section?.id || !section?.collection) return currentSections;

      fetch(`/api/admin/firebase/${section.collection}/${section.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(section),
      })
        .then(() => {
          setHasUnsavedChanges(false);
        })
        .catch((err) => {
          console.error(`Failed to save section ${sectionKey}`, err);
        });

      return currentSections;
    });
  }, []);

  const saveAll = useCallback(async () => {
    const keys = Object.keys(sections);
    const promises = keys.map((key) => {
      const section = sections[key];
      if (!section?.id || !section?.collection) return Promise.resolve();

      return fetch(`/api/admin/firebase/${section.collection}/${section.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(section),
      });
    });

    try {
      await Promise.all(promises);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to save all sections", err);
      throw err;
    }
  }, [sections]);

  return (
    <PageContext.Provider
      value={{
        sections,
        hasUnsavedChanges,
        setSection,
        editField,
        saveSection,
        saveAll,
      }}
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
