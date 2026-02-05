/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import {
  ImageIcon,
  VideoIcon,
  Trash2Icon,
  PlusIcon,
  GripVerticalIcon,
  Link2Icon,
  UploadIcon,
  XIcon,
  Loader2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";

interface ProjectMedia {
  link: string;
  type: "image" | "video";
}

interface ProjectMediaManagerProps {
  medias: ProjectMedia[];
  projectId: string;
  onUpdate: (medias: ProjectMedia[]) => Promise<void>;
  isEditing: boolean;
}

export function ProjectMediaManager({
  medias,
  projectId,
  onUpdate,
  isEditing,
}: ProjectMediaManagerProps) {
  const [localMedias, setLocalMedias] = useState<ProjectMedia[]>(medias || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalMedias(medias || []);
    setCurrentIndex(0);
  }, [projectId, medias]);

  const handleSave = async (newMedias: ProjectMedia[]) => {
    setSaving(true);
    try {
      await onUpdate(newMedias);
      setLocalMedias(newMedias);
    } catch (error) {
      console.error("Failed to save medias:", error);
      toast.error("Failed to save media changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to delete this media?")) return;

    const newMedias = localMedias.filter((_, i) => i !== index);
    await handleSave(newMedias);

    if (currentIndex >= newMedias.length && newMedias.length > 0) {
      setCurrentIndex(newMedias.length - 1);
    } else if (newMedias.length === 0) {
      setCurrentIndex(0);
    }
  };

  const handleAdd = async (media: ProjectMedia) => {
    const newMedias = [...localMedias, media];
    await handleSave(newMedias);
    setShowAddModal(false);
    setCurrentIndex(newMedias.length - 1);
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newMedias = [...localMedias];
    const [movedItem] = newMedias.splice(fromIndex, 1);
    newMedias.splice(toIndex, 0, movedItem);
    await handleSave(newMedias);
    setCurrentIndex(toIndex);
  };

  if (localMedias.length === 0 && !isEditing) {
    return null;
  }

  return (
    <div className="space-y-4">
      {localMedias.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-300">
              Project Gallery
            </h3>
            {isEditing && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2 text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Add Media
              </button>
            )}
          </div>

          <div className="relative aspect-video bg-neutral-950 rounded-lg overflow-hidden border border-neutral-700">
            {localMedias[currentIndex].type === "image" ? (
              <img
                src={localMedias[currentIndex].link}
                alt={`Project media ${currentIndex + 1}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <iframe
                  src={localMedias[currentIndex].link}
                  className="w-full h-full"
                  allowFullScreen
                  title={`Project video ${currentIndex + 1}`}
                />
              </div>
            )}

            {localMedias.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev > 0 ? prev - 1 : localMedias.length - 1,
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-neutral-900/80 backdrop-blur rounded-full hover:bg-neutral-800 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev < localMedias.length - 1 ? prev + 1 : 0,
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-neutral-900/80 backdrop-blur rounded-full hover:bg-neutral-800 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-neutral-900/80 backdrop-blur rounded-full text-sm">
              {currentIndex + 1} / {localMedias.length}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 px-1 pt-1">
            {localMedias.map((media, index) => (
              <div
                key={index}
                className={`relative flex-shrink-0 cursor-pointer group ${
                  index === currentIndex
                    ? "ring-2 ring-primary"
                    : "ring-1 ring-neutral-700 hover:ring-neutral-500"
                } rounded-lg overflow-hidden transition-all`}
                onClick={() => setCurrentIndex(index)}
              >
                {media.type === "image" ? (
                  <img
                    src={media.link}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-24 h-16 object-cover"
                  />
                ) : (
                  <div className="w-24 h-16 bg-neutral-800 flex items-center justify-center">
                    <VideoIcon className="w-6 h-6 text-neutral-500" />
                  </div>
                )}

                {isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2Icon className="w-3 h-3" />
                  </button>
                )}

                {isEditing && (
                  <div
                    className="absolute left-1 top-1/2 -translate-y-1/2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(index));
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = parseInt(
                        e.dataTransfer.getData("text/plain"),
                      );
                      handleReorder(fromIndex, index);
                    }}
                  >
                    <GripVerticalIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isEditing && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex-shrink-0 w-24 h-16 border-2 border-dashed border-neutral-700 rounded-lg hover:border-primary transition-colors flex items-center justify-center"
              >
                <PlusIcon className="w-6 h-6 text-neutral-500" />
              </button>
            )}
          </div>
        </div>
      )}

      {localMedias.length === 0 && isEditing && (
        <div className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400 mb-4">No media added yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add First Media
          </button>
        </div>
      )}

      {showAddModal && (
        <AddMediaModal
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
          saving={saving}
        />
      )}
    </div>
  );
}

interface AddMediaModalProps {
  onAdd: (media: ProjectMedia) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

function AddMediaModal({ onAdd, onClose, saving }: AddMediaModalProps) {
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const [preview, setPreview] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Please upload a valid image or video file");
      return;
    }

    const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${isImage ? "10MB" : "50MB"}`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setUploadedFile(file);
      setMediaType(isImage ? "image" : "video");
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);

    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
        setPreview("");
        return;
      }

      const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
      const isVimeo = url.includes("vimeo.com");

      if (isYouTube || isVimeo) {
        setMediaType("video");
        setPreview(url);
      } else {
        const img = new Image();
        img.onload = () => {
          setMediaType("image");
          setPreview(url);
        };
        img.onerror = () => {
          setPreview("");
          toast.error("Failed to load image from URL");
        };
        img.src = url;
      }
    } catch {
      setPreview("");
    }
  };

  const handleSubmit = async () => {
    if (!preview) {
      toast.error("Please add a valid image or video");
      return;
    }

    setUploading(true);

    try {
      let finalUrl = preview;

      if (uploadedFile && mediaType === "image") {
        finalUrl = await uploadToCloudinary(uploadedFile);
      }

      await onAdd({
        link: finalUrl,
        type: mediaType,
      });

      toast.success("Media added successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to add media:", error);
      toast.error("Failed to add media");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10001] p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 rounded-xl p-6 max-w-lg w-full space-y-4 border border-neutral-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Add Media</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-neutral-800/50 rounded-lg">
          <button
            onClick={() => setUploadMethod("file")}
            className={`flex-1 px-3 py-2 rounded transition-colors ${
              uploadMethod === "file"
                ? "bg-primary text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <UploadIcon className="w-4 h-4 inline mr-2" />
            Upload File
          </button>
          <button
            onClick={() => setUploadMethod("url")}
            className={`flex-1 px-3 py-2 rounded transition-colors ${
              uploadMethod === "url"
                ? "bg-primary text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Link2Icon className="w-4 h-4 inline mr-2" />
            From URL
          </button>
        </div>

        {uploadMethod === "file" ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-8 border-2 border-dashed border-neutral-700 rounded-lg hover:border-primary transition-colors flex flex-col items-center gap-2 text-neutral-400 hover:text-white"
            >
              <ImageIcon className="w-8 h-8" />
              <span className="text-sm">
                {uploadedFile ? uploadedFile.name : "Click to upload"}
              </span>
              <span className="text-xs text-neutral-500">
                Images (max 10MB) or Videos (max 50MB)
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.png or YouTube/Vimeo URL"
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-neutral-500">
              Supports direct image URLs, YouTube, and Vimeo links
            </p>
          </div>
        )}

        {preview && (
          <div className="relative border border-neutral-700 rounded-lg overflow-hidden bg-neutral-950">
            {mediaType === "image" ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-contain"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-neutral-900">
                <VideoIcon className="w-12 h-12 text-neutral-600" />
                <span className="ml-2 text-neutral-400">Video ready</span>
              </div>
            )}
            <button
              onClick={() => {
                setPreview("");
                setUrlInput("");
                setUploadedFile(null);
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
            disabled={uploading || saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!preview || uploading || saving}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading || saving ? (
              <>
                <Loader2Icon className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Media"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
