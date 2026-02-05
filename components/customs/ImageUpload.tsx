/* eslint-disable @next/next/no-img-element */

"use client";

import { ImageIcon, Link2Icon, UploadIcon, XIcon } from "lucide-react";
import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";

interface ImageUploadProps {
  value: string;
  onChange: (value: string, file?: File | null) => void;
  label: string;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  label,
  placeholder,
}: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState(value);
  const [urlInput, setUrlInput] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setUploadedFile(file);
      onChange(result, file);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);

    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
        setImagePreview("");
        return;
      }

      const isImageUrl = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
      if (isImageUrl) {
        const img = new Image();
        img.onload = () => {
          setImagePreview(url);
          setUploadedFile(null);
          onChange(url, null);
        };
        img.onerror = () => {
          setImagePreview("");
          toast.error("Failed to load image from URL");
        };
        img.src = url;
      } else {
        setImagePreview("");
      }
    } catch {
      setImagePreview("");
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">{label}</label>

      <div className="flex gap-2 p-1 bg-neutral-800/50 rounded-lg">
        <button
          type="button"
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
          type="button"
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
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-3 border-2 border-dashed border-neutral-700 rounded-lg hover:border-primary transition-colors flex flex-col items-center gap-2 text-neutral-400 hover:text-white"
          >
            <ImageIcon className="w-8 h-8" />
            <span className="text-sm">
              {uploadedFile ? uploadedFile.name : "Click to upload image"}
            </span>
            <span className="text-xs text-neutral-500">
              PNG, JPG, GIF, WEBP or SVG (max 5MB)
            </span>
          </button>
        </div>
      ) : (
        <Input
          type="url"
          value={urlInput}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={placeholder || "https://example.com/image.png"}
        />
      )}

      {imagePreview && (
        <div className="relative border border-neutral-700 rounded-lg overflow-hidden">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-40 object-contain bg-neutral-900"
            onError={() => {
              setImagePreview("");
              toast.error("Invalid image URL");
            }}
          />
          <button
            type="button"
            onClick={() => {
              setImagePreview("");
              setUrlInput("");
              setUploadedFile(null);
              onChange("", null);
            }}
            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
