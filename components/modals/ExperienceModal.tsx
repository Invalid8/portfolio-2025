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
import { Experience } from "@/types";

interface AddExperienceModalProps {
  onAdd: (experience: Omit<Experience, "id">) => Promise<void>;
}

export function AddExperienceModal({ onAdd }: AddExperienceModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    role: "",
    duration: "",
    companyName: "",
    companyLocation: "",
    companyLink: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onAdd({
        position: {
          title: formData.title,
          role: formData.role,
          duration: formData.duration,
        },
        company: {
          name: formData.companyName,
          location: formData.companyLocation,
          link: formData.companyLink,
          logo: "",
        },
        skills: [],
      });

      setOpen(false);
      setFormData({
        title: "",
        role: "",
        duration: "",
        companyName: "",
        companyLocation: "",
        companyLink: "",
      });
    } catch (error) {
      console.error("Failed to add experience:", error);
      toast.error("Failed to add experience");
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
          Add <span className="hidden lg:block">New Experience</span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Add New Experience
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Job Title *
              </label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Frontend Developer"
                className="bg-neutral-800/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Role Description *
              </label>
              <Textarea
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                placeholder="Describe your role and responsibilities"
                rows={3}
                className="bg-neutral-800/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Duration *
              </label>
              <Input
                required
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="Jan 2023 - Present"
                className="bg-neutral-800/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Company Name *
              </label>
              <Input
                required
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="Company Inc."
                className="bg-neutral-800/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <Input
                  value={formData.companyLocation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      companyLocation: e.target.value,
                    })
                  }
                  placeholder="Remote / City, Country"
                  className="bg-neutral-800/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Link (optional)
                </label>
                <Input
                  type="url"
                  value={formData.companyLink}
                  onChange={(e) =>
                    setFormData({ ...formData, companyLink: e.target.value })
                  }
                  placeholder="https://company.com"
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
                  "Add Experience"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface EditExperienceModalProps {
  experience: Experience | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (
    id: string | number,
    data: Omit<Experience, "id">,
  ) => Promise<void>;
}

export function EditExperienceModal({
  experience,
  open,
  onOpenChange,
  onUpdate,
}: EditExperienceModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    role: "",
    duration: "",
    companyName: "",
    companyLocation: "",
    companyLink: "",
  });

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.position?.title || "",
        role: experience.position?.role || "",
        duration: experience.position?.duration || "",
        companyName: experience.company?.name || "",
        companyLocation: experience.company?.location || "",
        companyLink: experience.company?.link || "",
      });
    }
  }, [experience]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!experience) return;

    setLoading(true);

    try {
      await onUpdate(experience.id, {
        position: {
          title: formData.title,
          role: formData.role,
          duration: formData.duration,
        },
        company: {
          name: formData.companyName,
          location: formData.companyLocation,
          link: formData.companyLink,
          logo: experience.company?.logo || "",
        },
        skills: experience.skills || [],
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update experience:", error);
      toast.error("Failed to update experience");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Experience
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Job Title *
            </label>
            <Input
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Frontend Developer"
              className="bg-neutral-800/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Role Description *
            </label>
            <Textarea
              required
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              placeholder="Describe your role and responsibilities"
              rows={3}
              className="bg-neutral-800/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration *</label>
            <Input
              required
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              placeholder="Jan 2023 - Present"
              className="bg-neutral-800/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Company Name *
            </label>
            <Input
              required
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              placeholder="Company Inc."
              className="bg-neutral-800/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                value={formData.companyLocation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companyLocation: e.target.value,
                  })
                }
                placeholder="Remote / City, Country"
                className="bg-neutral-800/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Company Link (optional)
              </label>
              <Input
                type="url"
                value={formData.companyLink}
                onChange={(e) =>
                  setFormData({ ...formData, companyLink: e.target.value })
                }
                placeholder="https://company.com"
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
                "Update Experience"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
