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
import {
  EyeIcon,
  EditIcon,
  SaveIcon,
  XIcon,
  TypeIcon,
  BoldIcon,
  ItalicIcon,
  ListIcon,
  LinkIcon,
  CodeIcon,
  ImageIcon,
  Heading1Icon,
  Heading2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { usePageContext } from "@/lib/context/PageContent";
import { cn } from "@/lib/utils";

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

  const insertMarkdown = (
    before: string,
    after: string = "",
    placeholder: string = "text",
  ) => {
    const textarea = document.querySelector(
      "textarea[data-markdown-editor]",
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
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
        <DialogContent className="md:max-w-6xl w-full h-[90vh] flex flex-col z-[10001] p-0 gap-0 bg-neutral-950 border-neutral-800">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TypeIcon className="w-5 h-5 text-primary" />
                </div>
                {title}
              </DialogTitle>
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium",
                  isPreview
                    ? "bg-primary text-white"
                    : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300",
                )}
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
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {!isPreview && (
              <div className="flex items-center gap-1 px-4 py-3 border-b border-neutral-800 bg-neutral-900/50 overflow-x-auto">
                <ToolbarButton
                  icon={<Heading1Icon className="w-4 h-4" />}
                  label="Heading 1"
                  onClick={() => insertMarkdown("# ", "", "Heading")}
                />
                <ToolbarButton
                  icon={<Heading2Icon className="w-4 h-4" />}
                  label="Heading 2"
                  onClick={() => insertMarkdown("## ", "", "Heading")}
                />
                <div className="w-px h-6 bg-neutral-700 mx-1" />
                <ToolbarButton
                  icon={<BoldIcon className="w-4 h-4" />}
                  label="Bold"
                  onClick={() => insertMarkdown("**", "**", "bold text")}
                />
                <ToolbarButton
                  icon={<ItalicIcon className="w-4 h-4" />}
                  label="Italic"
                  onClick={() => insertMarkdown("*", "*", "italic text")}
                />
                <div className="w-px h-6 bg-neutral-700 mx-1" />
                <ToolbarButton
                  icon={<LinkIcon className="w-4 h-4" />}
                  label="Link"
                  onClick={() => insertMarkdown("[", "](url)", "link text")}
                />
                <ToolbarButton
                  icon={<ImageIcon className="w-4 h-4" />}
                  label="Image"
                  onClick={() => insertMarkdown("![", "](url)", "alt text")}
                />
                <div className="w-px h-6 bg-neutral-700 mx-1" />
                <ToolbarButton
                  icon={<ListIcon className="w-4 h-4" />}
                  label="List"
                  onClick={() => insertMarkdown("- ", "", "list item")}
                />
                <ToolbarButton
                  icon={<CodeIcon className="w-4 h-4" />}
                  label="Code"
                  onClick={() => insertMarkdown("```\n", "\n```", "code")}
                />
              </div>
            )}

            <div className="flex-1 overflow-auto p-6">
              {isPreview ? (
                <div className="prose prose-invert prose-lg max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <Textarea
                    data-markdown-editor
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="h-full resize-none font-mono text-sm bg-neutral-900/50 border-neutral-800 focus:border-primary focus:ring-primary/20"
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
Explain challenges you faced..."
                  />

                  <div className="mt-4 p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                    <h4 className="text-sm font-semibold mb-3 text-neutral-300 flex items-center gap-2">
                      <CodeIcon className="w-4 h-4 text-primary" />
                      Markdown Guide
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <GuideItem code="# Heading 1" desc="Main heading" />
                      <GuideItem code="## Heading 2" desc="Sub heading" />
                      <GuideItem code="**bold**" desc="Bold text" />
                      <GuideItem code="*italic*" desc="Italic text" />
                      <GuideItem code="[link](url)" desc="Hyperlink" />
                      <GuideItem code="- list item" desc="Bullet list" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/30">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-neutral-500">
                {content.length} characters
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-neutral-700 hover:bg-neutral-800"
                >
                  <XIcon className="w-4 h-4" />
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave}>
                  <SaveIcon className="w-4 h-4" />
                  Save Content
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
    >
      {icon}
    </button>
  );
}

function GuideItem({ code, desc }: { code: string; desc: string }) {
  return (
    <div className="flex flex-col gap-1">
      <code className="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-mono">
        {code}
      </code>
      <span className="text-neutral-500">{desc}</span>
    </div>
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
