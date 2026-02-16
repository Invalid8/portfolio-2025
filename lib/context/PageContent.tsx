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
import { toast } from "sonner";

export interface PendingImage {
  file: File | null;
  localUrl: string;
  sectionKey: string;
  fieldKey: string;
  collection: string;
  docId: string;
  isExternal?: boolean;
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

const dirtyKey = (collection: string, sectionKey: string) =>
  `${collection}:${sectionKey}`;

export const PageProvider = ({
  children,
  initialSections = {},
}: {
  children: ReactNode;
  initialSections?: NestedSections;
}) => {
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<NestedSections>(initialSections);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [dirtySections, setDirtySections] = useState<Set<string>>(new Set());

  const hasUnsavedChanges = dirtySections.size > 0;

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
      setSections((prev) => {
        const currentSection = prev[collection]?.[sectionKey];

        if (!currentSection) {
          console.error(`Section not found: ${collection}/${sectionKey}`);
          return prev;
        }

        const keys = fieldKey.split(".");
        const updated = { ...currentSection };

        if (keys.length === 1) {
          updated[fieldKey] = value;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let current: any = updated;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
        }

        return {
          ...prev,
          [collection]: {
            ...prev[collection],
            [sectionKey]: updated,
          },
        };
      });

      setDirtySections((prev) => {
        const next = new Set(prev);
        next.add(dirtyKey(collection, sectionKey));
        return next;
      });
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

    setDirtySections((prev) => {
      const next = new Set(prev);
      next.add(dirtyKey(image.collection, image.sectionKey));
      return next;
    });
  }, []);

  const saveSection = useCallback(
    async (collection: string, sectionKey: string) => {
      if (saving) return;
      setSaving(true);

      try {
        const section = sections[collection]?.[sectionKey];
        if (!section?.id || !section?.collection) {
          console.error(`Invalid section: ${collection}/${sectionKey}`);
          setSaving(false);
          return;
        }

        const images = pendingImages.filter(
          (img) =>
            img.collection === collection && img.sectionKey === sectionKey,
        );

        let updatedSection: Section = { ...section };

        for (const img of images) {
          const url = img.isExternal
            ? img.localUrl
            : await uploadToCloudinary(img.file!);

          const keys = img.fieldKey.split(".");
          if (keys.length === 1) {
            updatedSection = { ...updatedSection, [img.fieldKey]: url };
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let current: any = updatedSection;
            for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) {
                current[keys[i]] = {};
              }
              current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = url;
          }
        }

        const response = await fetch(
          `/api/admin/firebase/${updatedSection.collection}/${updatedSection.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedSection),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to save section");
        }

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

        setDirtySections((prev) => {
          const next = new Set(prev);
          next.delete(dirtyKey(collection, sectionKey));
          return next;
        });

        toast.success("Changes saved successfully!");
      } catch (error) {
        console.error("Save failed:", error);
        toast.error("Failed to save changes");
      } finally {
        setSaving(false);
      }
    },
    [sections, pendingImages, saving],
  );

  const saveAll = useCallback(async () => {
    if (saving || dirtySections.size === 0) return;
    setSaving(true);

    try {
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

        const keys = img.fieldKey.split(".");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any = updatedSections[img.collection][img.sectionKey];

        if (keys.length === 1) {
          updatedSections[img.collection][img.sectionKey] = {
            ...current,
            [img.fieldKey]: url,
          };
        } else {
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = url;
        }
      }

      for (const entry of dirtySections) {
        const [collection, key] = entry.split(":");
        const section = updatedSections[collection]?.[key];

        if (!section?.id || !section?.collection) {
          console.error(`Invalid section for save: ${entry}`);
          continue;
        }

        const response = await fetch(
          `/api/admin/firebase/${section.collection}/${section.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(section),
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to save ${entry}`);
        }
      }

      setSections(updatedSections);
      setPendingImages([]);
      setDirtySections(new Set());
      toast.success("All changes saved successfully!");
    } catch (error) {
      console.error("Save all failed:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }, [sections, pendingImages, dirtySections, saving]);

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
