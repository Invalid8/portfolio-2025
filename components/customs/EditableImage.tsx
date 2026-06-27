"use client";

// Portfolio skin over @dalgoridim/headless-cms (see README → "Headless CMS").
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { CameraIcon, Link2Icon, XIcon, CheckIcon } from "lucide-react";
import { EditableImage as HeadlessEditableImage } from "@dalgoridim/headless-cms/client";
import { cn } from "@/lib/utils";

interface EditableImageProps {
  /** Id of the item this image field belongs to. */
  itemId: string;
  fieldKey: string;
  src: string;
  collection: string;
  className?: string;
}

function Placeholder() {
  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto rounded-2xl bg-neutral-800/50 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-neutral-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-neutral-500 text-lg">No image available</p>
      </div>
    </div>
  );
}

export default function EditableImage({
  itemId,
  fieldKey,
  src,
  collection,
  className,
}: EditableImageProps) {
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlPreview, setUrlPreview] = useState("");
  const [urlError, setUrlError] = useState(false);

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    try {
      const url = new URL(value);
      setUrlPreview(
        url.protocol === "http:" || url.protocol === "https:" ? value : "",
      );
    } catch {
      setUrlPreview("");
    }
  };

  return (
    <HeadlessEditableImage
      itemId={itemId}
      fieldKey={fieldKey}
      src={src}
      collection={collection}
      className={className}
    >
      {({ isEditing, saving, hasError, openFilePicker, setExternalUrl, imgProps }) => {
        const imageNode =
          hasError || !imgProps.src ? (
            <Placeholder />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...imgProps} alt="" className="w-full h-full object-cover" />
          );

        if (!isEditing) return <>{imageNode}</>;

        return (
          <>
            <div className="relative group w-full h-full">
              {imageNode}

              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                {saving ? (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="flex gap-12">
                    <CameraIcon
                      className="w-12 h-12 text-white cursor-pointer hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFilePicker();
                      }}
                    />
                    <Link2Icon
                      className="w-12 h-12 text-white cursor-pointer hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUrlModal(true);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {showUrlModal &&
              createPortal(
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-9999 p-4">
                  <div className="bg-neutral-900 rounded-xl p-6 max-w-sm w-full space-y-4">
                    <h3 className="text-lg font-bold">Add Image URL</h3>

                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://example.com/image.png"
                      className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700"
                    />

                    {urlPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={urlPreview}
                        alt=""
                        className={cn(
                          "w-full h-40 object-contain rounded",
                          urlError && "hidden",
                        )}
                        onError={() => setUrlError(true)}
                      />
                    ) : (
                      <div className="h-40 flex items-center justify-center text-neutral-500">
                        Invalid URL
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowUrlModal(false)}
                        className="px-3 py-1 bg-neutral-700 rounded text-sm"
                      >
                        <XIcon className="w-4 h-4 inline" /> Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (setExternalUrl(urlPreview)) {
                            setShowUrlModal(false);
                            setUrlInput("");
                            setUrlPreview("");
                            setUrlError(false);
                          }
                        }}
                        disabled={!urlPreview}
                        className="px-3 py-1 bg-primary rounded text-sm disabled:opacity-50"
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
      }}
    </HeadlessEditableImage>
  );
}
