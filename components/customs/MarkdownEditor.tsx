"use client";

// Portfolio skin over @dalgoridim/headless-cms (see README → "Headless CMS").
// Editing surface is @uiw/react-md-editor (source + live preview, toolbar,
// native undo/redo); the headless engine only persists the resulting string.
import React, { useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { EditIcon, SaveIcon, XIcon, TypeIcon } from "lucide-react";
import { toast } from "sonner";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  initialValue: string;
  onSave: (content: string) => void;
  trigger?: React.ReactNode;
  title?: string;
}

export function MarkdownEditor({
  initialValue,
  onSave,
  trigger,
  title = "Edit Content",
}: MarkdownEditorProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(initialValue);

  const handleOpen = () => {
    setContent(initialValue);
    setOpen(true);
  };

  const handleSave = () => {
    onSave(content);
    setOpen(false);
  };

  const handleCancel = () => {
    setContent(initialValue);
    setOpen(false);
  };

  return (
    <>
      {trigger ? (
        <div onClick={handleOpen}>{trigger}</div>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors"
        >
          <EditIcon className="w-4 h-4" />
          Edit Content
        </button>
      )}

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/70 p-4">
            <div className="md:max-w-6xl w-full h-[90vh] flex flex-col bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-neutral-800">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TypeIcon className="w-5 h-5 text-primary" />
                  </div>
                  {title}
                </h2>
              </div>

              <div
                data-color-mode="dark"
                className="flex-1 min-h-0 p-4 [&_.w-md-editor]:!h-full [&_.w-md-editor]:!bg-transparent [&_.w-md-editor]:!shadow-none"
              >
                <MDEditor
                  value={content}
                  onChange={(v) => setContent(v ?? "")}
                  height="100%"
                  preview="live"
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder:
                      "# Project Title\n\n## Overview\nWrite your description here...",
                  }}
                />
              </div>

              <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/30">
                <div className="flex items-center justify-between w-full">
                  <p className="text-sm text-neutral-500">
                    {content.length} characters
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-neutral-700 hover:bg-neutral-800 transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-white hover:opacity-90 transition-opacity"
                    >
                      <SaveIcon className="w-4 h-4" />
                      Save Content
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

interface ProjectContentEditorProps {
  content: string;
  onSave: (content: string) => Promise<void>;
}

export function ProjectContentEditor({
  content,
  onSave,
}: ProjectContentEditorProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = async (newContent: string) => {
    setSaving(true);
    try {
      await onSave(newContent);
      toast.success("Content saved successfully!");
    } catch (error) {
      console.error("Failed to save content:", error);
      toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MarkdownEditor
      initialValue={content}
      onSave={handleSave}
      title="Edit Project Content"
      trigger={
        <button
          className="px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-2 border border-neutral-700 hover:border-primary/50"
          disabled={saving}
        >
          <EditIcon className="w-4 h-4" />
          {saving ? "Saving..." : "Edit Full Content"}
        </button>
      }
    />
  );
}
