"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { uploadToCloudinary } from "../cloudinary/upload";
import { NestedSections, Section } from "@/types";

export interface PendingImage {
  file: File | null;
  localUrl: string;
  sectionKey: string;
  fieldKey: string;
  collection: string;
  docId: string;
  isExternal?: boolean;
  clear?: boolean;
}

interface PageContextType {
  sections: NestedSections;
  hasUnsavedChanges: boolean;
  saving: boolean;
  pendingImages: PendingImage[];
  setSection: (collection: string, key: string, section: Section) => void;
  editField: (
    collection: string,
    sectionKey: string,
    fieldKey: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => void;
  setPendingImage: (image: PendingImage) => void;
  saveSection: (collection: string, sectionKey: string) => Promise<void>;
  saveAll: () => Promise<void>;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider = ({
  children,
  initialSections = {},
}: {
  children: ReactNode;
  initialSections?: NestedSections;
}) => {
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<NestedSections>(initialSections);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  const setSection = useCallback(
    (collection: string, key: string, section: Section) => {
      setSections((prev) => ({
        ...prev,
        [collection]: { ...prev[collection], [key]: section },
      }));
    },
    [],
  );

  const editField = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (collection: string, sectionKey: string, fieldKey: string, value: any) => {
      setSections((prev) => ({
        ...prev,
        [collection]: {
          ...prev[collection],
          [sectionKey]: {
            ...prev[collection][sectionKey],
            [fieldKey]: value,
          },
        },
      }));
      setHasUnsavedChanges(true);
    },
    [],
  );

  const setPendingImage = useCallback((image: PendingImage) => {
    setPendingImages((prev) => [
      ...prev.filter(
        (img) =>
          !(
            img.collection === image.collection &&
            img.sectionKey === image.sectionKey &&
            img.fieldKey === image.fieldKey
          ),
      ),
      image,
    ]);
    setHasUnsavedChanges(true);
  }, []);

  const saveSection = useCallback(
    async (collection: string, sectionKey: string) => {
      if (saving) return;
      setSaving(true);

      const section = sections[collection]?.[sectionKey];
      if (!section || !section.id || !section.collection) {
        setSaving(false);
        return;
      }

      const images = pendingImages.filter(
        (img) => img.collection === collection && img.sectionKey === sectionKey,
      );

      let updatedSection: Section = { ...section };
      for (const img of images) {
        const url = img.isExternal
          ? img.localUrl
          : await uploadToCloudinary(img.file!);
        updatedSection = { ...updatedSection, [img.fieldKey]: url };
      }

      await fetch(
        `/api/admin/firebase/${updatedSection.collection}/${updatedSection.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSection),
        },
      );

      setSections((prev) => ({
        ...prev,
        [collection]: { ...prev[collection], [sectionKey]: updatedSection },
      }));

      setPendingImages((prev) =>
        prev.filter(
          (img) =>
            !(img.collection === collection && img.sectionKey === sectionKey),
        ),
      );
      setHasUnsavedChanges(false);
      setSaving(false);
    },
    [sections, pendingImages, saving],
  );

  const saveAll = useCallback(async () => {
    if (saving) return;
    setSaving(true);

    const updatedSections: NestedSections = { ...sections };

    for (const img of pendingImages) {
      const url = img.isExternal
        ? img.localUrl
        : await uploadToCloudinary(img.file!);

      if (!updatedSections[img.collection])
        updatedSections[img.collection] = {};
      if (!updatedSections[img.collection][img.sectionKey]) {
        updatedSections[img.collection][img.sectionKey] = {
          id: img.docId,
          collection: img.collection,
        };
      }

      updatedSections[img.collection][img.sectionKey] = {
        ...updatedSections[img.collection][img.sectionKey],
        [img.fieldKey]: url,
      };
    }

    for (const collection of Object.keys(updatedSections)) {
      for (const key of Object.keys(updatedSections[collection])) {
        const section = updatedSections[collection][key];
        if (!section.id || !section.collection) continue;

        await fetch(`/api/admin/firebase/${section.collection}/${section.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(section),
        });
      }
    }

    setSections(updatedSections);
    setPendingImages([]);
    setHasUnsavedChanges(false);
    setSaving(false);
  }, [sections, pendingImages, saving]);

  return (
    <PageContext.Provider
      value={{
        sections,
        hasUnsavedChanges,
        pendingImages,
        saving,
        setSection,
        editField,
        setPendingImage,
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
