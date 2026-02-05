"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "../customs/ImageUpload";
import { Project } from "@/types";

interface AddProjectModalProps {
  onAdd: (project: FormData) => Promise<void>;
}

export function AddProjectModal({ onAdd }: AddProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thumbnailData, setThumbnailData] = useState<{
    url: string;
    file: File | null;
  }>({ url: "", file: null });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "challenge",
    role: "Frontend Developer",
    link: "",
    github: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!thumbnailData.url) {
      toast.error("Please add a thumbnail image");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      if (thumbnailData.file) {
        submitData.append("thumbnailFile", thumbnailData.file);
      } else {
        submitData.append("thumbnail", thumbnailData.url);
      }

      submitData.append("medias", JSON.stringify([]));
      submitData.append("content", "");

      await onAdd(submitData);

      setOpen(false);
      setFormData({
        title: "",
        description: "",
        type: "challenge",
        role: "Frontend Developer",
        link: "",
        github: "",
        date: new Date().toISOString().split("T")[0],
      });
      setThumbnailData({ url: "", file: null });
    } catch (error) {
      console.error("Failed to add project:", error);
      toast.error("Failed to add project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-3 md:px-8 px-6 py-4 bg-primary/10 backdrop-blur border border-primary/30 rounded-full hover:bg-primary/20 transition-all"
      >
        <PlusIcon className="w-5 h-5 text-primary" />
        <span className="font-medium text-primary flex gap-2 items-center">
          Add <span className="hidden lg:block">New Project</span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="md:max-w-2xl max-h-[80vh] overflow-y-auto bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Add New Project
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              value={thumbnailData.url}
              onChange={(url, file) =>
                setThumbnailData({ url, file: file ?? null })
              }
              label="Project Thumbnail *"
              placeholder="https://example.com/thumbnail.png"
            />

            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="My Awesome Project"
                className="bg-neutral-800/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="A brief description of your project..."
                rows={3}
                className="bg-neutral-800/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type *</label>
                <select
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="challenge">Challenge</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="vibe code">Vibe Code</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role *</label>
                <Input
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="Frontend Developer"
                  className="bg-neutral-800/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Completion Date *
              </label>
              <Input
                type="month"
                required
                value={formData.date.substring(0, 7)}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value + "-01" })
                }
                className="bg-neutral-800/50"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Select the month and year you completed this project
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Live Link (optional)
                </label>
                <Input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="bg-neutral-800/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  GitHub Link (optional)
                </label>
                <Input
                  type="url"
                  value={formData.github}
                  onChange={(e) =>
                    setFormData({ ...formData, github: e.target.value })
                  }
                  placeholder="https://github.com/username/repo"
                  className="bg-neutral-800/50"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface EditProjectModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string | number, data: FormData) => Promise<void>;
}

export function EditProjectModal({
  project,
  open,
  onOpenChange,
  onUpdate,
}: EditProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [thumbnailData, setThumbnailData] = useState<{
    url: string;
    file: File | null;
  }>({ url: "", file: null });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "challenge",
    role: "",
    link: "",
    github: "",
    date: "",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        type: project.type || "challenge",
        role: project.role || "",
        link: project.link || "",
        github: project.github || "",
        date: project.date || "",
      });
      setThumbnailData({ url: project.thumbnail || "", file: null });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) return;

    if (!thumbnailData.url) {
      toast.error("Please add a thumbnail image");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      if (thumbnailData.file) {
        submitData.append("thumbnailFile", thumbnailData.file);
      } else {
        submitData.append("thumbnail", thumbnailData.url);
      }

      submitData.append("medias", JSON.stringify(project.medias || []));
      submitData.append("content", project.content || "");

      await onUpdate(project.id, submitData);

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update project:", error);
      toast.error("Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-2xl max-h-[80vh] overflow-y-auto bg-neutral-900 border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ImageUpload
            value={thumbnailData.url}
            onChange={(url, file) =>
              setThumbnailData({ url, file: file ?? null })
            }
            label="Project Thumbnail *"
            placeholder="https://example.com/thumbnail.png"
          />

          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="My Awesome Project"
              className="bg-neutral-800/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="A brief description of your project..."
              rows={3}
              className="bg-neutral-800/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <select
                className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="challenge">Challenge</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="hackathon">Hackathon</option>
                <option value="vibe code">Vibe Code</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role *</label>
              <Input
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                placeholder="Frontend Developer"
                className="bg-neutral-800/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Completion Date *
            </label>
            <Input
              type="month"
              required
              value={formData.date.substring(0, 7)}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value + "-01" })
              }
              className="bg-neutral-800/50"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Select the month and year you completed this project
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Live Link (optional)
              </label>
              <Input
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="https://example.com"
                className="bg-neutral-800/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                GitHub Link (optional)
              </label>
              <Input
                type="url"
                value={formData.github}
                onChange={(e) =>
                  setFormData({ ...formData, github: e.target.value })
                }
                placeholder="https://github.com/username/repo"
                className="bg-neutral-800/50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
