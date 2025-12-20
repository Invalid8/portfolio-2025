/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useState } from "react";
import { CameraIcon } from "lucide-react";
import { useAuth } from "@/lib/context/auth";
import { uploadFileToFirebase } from "@/lib/firebase/storage";
import { usePageContext } from "@/lib/context/PageContent";
import { cn } from "@/lib/utils";

interface EditableImageProps {
  sectionKey: string;
  fieldKey: string;
  src: string;
  collection: string;
  docId: string;
  className?: string;
}

export default function EditableImage({
  sectionKey,
  fieldKey,
  src,
  collection,
  docId,
  className,
}: EditableImageProps) {
  const { isEditing, isAdmin } = useAuth();
  const { editField } = usePageContext();
  const [preview, setPreview] = useState(src);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    editField(sectionKey, fieldKey, localUrl);

    if (isAdmin) {
      setLoading(true);
      try {
        const storagePath = `sections/${sectionKey}/${fieldKey}-${Date.now()}`;
        const uploadedUrl = await uploadFileToFirebase(file, storagePath);

        editField(sectionKey, fieldKey, uploadedUrl);
        await fetch(`/api/admin/firebase/${collection}/${docId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            [fieldKey]: uploadedUrl,
            updatedAt: new Date(),
          }),
        });
        setPreview(uploadedUrl);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
        setError("Failed to upload image.");
        setPreview(src);
        editField(sectionKey, fieldKey, src);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <label
      htmlFor={`${sectionKey}-${fieldKey}`}
      className={`relative ${className} cursor-pointer`}
    >
      <img
        src={preview}
        alt=""
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      />

      {isEditing && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <CameraIcon className="w-8 h-8 text-white" />
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="text-white font-semibold">Uploading...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/70">
          <span className="text-white font-bold">{error}</span>
        </div>
      )}

      <input
        type="file"
        ref={inputRef}
        className={cn(
          "size-full absolute top-0 left-0 bottom-0 right-0 opacity-0",
          !isEditing && "hidden"
        )}
        name={`${sectionKey}-${fieldKey}`}
        accept="image/*"
        onChange={handleChange}
      />
    </label>
  );
}
