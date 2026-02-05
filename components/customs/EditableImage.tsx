"use client";

import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CameraIcon, Link2Icon, XIcon, CheckIcon } from "lucide-react";
import { useAuth } from "@/lib/context/auth";
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
  const { isEditing } = useAuth();
  const { editField, setPendingImage, pendingImages, saving } =
    usePageContext();
  const [preview, setPreview] = useState(src);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlPreview, setUrlPreview] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pendingImage = pendingImages.find(
    (img) => img.sectionKey === sectionKey && img.fieldKey === fieldKey,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (saving) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    editField(collection, sectionKey, fieldKey, localUrl);

    setPendingImage({
      file,
      localUrl,
      sectionKey,
      fieldKey,
      collection,
      docId,
      isExternal: false,
    });
  };

  const handleUrlConfirm = () => {
    if (!urlPreview) return;

    setPreview(urlPreview);
    editField(collection, sectionKey, fieldKey, urlPreview);

    setPendingImage({
      file: null,
      localUrl: urlPreview,
      sectionKey,
      fieldKey,
      collection,
      docId,
      isExternal: true,
    });

    setShowUrlModal(false);
    setUrlInput("");
    setUrlPreview("");
  };

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    try {
      const url = new URL(value);
      if (url.protocol === "http:" || url.protocol === "https:") {
        setUrlPreview(value);
      } else {
        setUrlPreview("");
      }
    } catch {
      setUrlPreview("");
    }
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src = "/images/placeholder.png";
  };

  const imgSrc = pendingImage?.localUrl || preview;

  if (!isEditing) {
    return <img src={imgSrc} alt="" className={className} onError={handleImageError} />;
  }

  return (
    <>
      <div className={`relative ${className} group`}>
        <img
          src={imgSrc}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-200"
          onError={handleImageError}
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          {saving ? (
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            <div className="flex gap-12">
              <CameraIcon
                className="w-12 h-12 text-white cursor-pointer hover:text-primary transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              />
              <Link2Icon
                className="w-12 h-12 text-white cursor-pointer hover:text-primary transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUrlModal(true);
                }}
              />
            </div>
          )}
        </div>

        <input
          type="file"
          ref={inputRef}
          className={cn("absolute inset-0 opacity-0 pointer-events-none")}
          accept="image/*"
          disabled={saving}
          onChange={handleFileChange}
        />
      </div>

      {showUrlModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-9999 p-4">
            <div className="bg-neutral-900 rounded-xl p-6 max-w-sm w-full space-y-4 relative">
              <h3 className="text-lg font-bold">Add Image URL</h3>
              <input
                type="text"
                placeholder="https://example.com/image.png"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full px-3 py-2 rounded border border-neutral-700 bg-neutral-800 text-white"
              />
              {urlPreview ? (
                <img
                  src={urlPreview}
                  alt="Preview"
                  className="w-full h-40 object-contain rounded"
                  onError={(e) => (e.currentTarget.src = "/images/placeholder.png")}
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-neutral-400 border border-neutral-700 rounded">
                  Invalid URL
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowUrlModal(false)}
                  className="px-3 py-1 bg-neutral-700 rounded text-sm hover:bg-neutral-600 transition"
                >
                  <XIcon className="w-4 h-4 inline" /> Cancel
                </button>
                <button
                  onClick={handleUrlConfirm}
                  disabled={!urlPreview}
                  className="px-3 py-1 bg-primary rounded text-sm hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckIcon className="w-4 h-4 inline" /> Confirm
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
