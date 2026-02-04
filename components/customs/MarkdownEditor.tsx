"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { EyeIcon, EditIcon, SaveIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { usePageContext } from "@/lib/context/PageContent";

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
  const [isPreview, setIsPreview] = useState(false);

  const handleSave = () => {
    onSave(content);
    setOpen(false);
  };

  const handleCancel = () => {
    setContent(initialValue);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setContent(initialValue);
    }
    setOpen(newOpen);
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setOpen(true)} variant="outline" size="sm">
          <EditIcon className="w-4 h-4" />
          Edit Content
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="md:max-w-4xl w-full h-[80vh] flex flex-col z-[10001]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{title}</span>
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                {isPreview ? (
                  <>
                    <EditIcon className="w-4 h-4" />
                    Edit
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-4 h-4" />
                    Preview
                  </>
                )}
              </button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {isPreview ? (
              <div className="prose prose-invert max-w-none p-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-full">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-full resize-none font-mono text-sm"
                  placeholder="# Project Title

## Overview
Write your project description here...

### Features
- Feature 1
- Feature 2

### Technologies Used
- React
- TypeScript
- Tailwind CSS

## Development Process
Describe your development process...

## Challenges & Solutions
Explain challenges you faced...
"
                />
                <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">
                    Markdown Guide:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400">
                    <div>
                      <code># Heading 1</code>
                    </div>
                    <div>
                      <code>## Heading 2</code>
                    </div>
                    <div>
                      <code>**bold**</code>
                    </div>
                    <div>
                      <code>*italic*</code>
                    </div>
                    <div>
                      <code>[link](url)</code>
                    </div>
                    <div>
                      <code>- list item</code>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              <XIcon className="w-4 h-4" />
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              <SaveIcon className="w-4 h-4" />
              Save Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ProjectContentEditorProps {
  projectId: string;
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
          className="px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-2"
          disabled={saving}
        >
          <EditIcon className="w-4 h-4" />
          {saving ? "Saving..." : "Edit Full Content"}
        </button>
      }
    />
  );
}
