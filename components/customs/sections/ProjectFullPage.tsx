"use client";

import { Project } from "@/types";
import ContentSpan from "@/components/customs/ContentEditSpan";
import EditableImage from "@/components/customs/EditableImage";
import { ProjectMediaManager } from "@/components/customs/ProjectMediaManager";
import { useAuth } from "@/lib/context/auth";
import { formatMonthYear, formatYear } from "@/utils/dateFormatter";
import Link from "next/link";
import { ExternalLinkIcon, GithubIcon, ArrowLeftIcon, CalendarIcon, UserIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { ProjectContentEditor } from "@/components/customs/MarkdownEditor";
import { useState } from "react";

export function ProjectFullPage({ project: initialProject }: { project: Project }) {
  const { isEditing, isAdmin } = useAuth();
  const [project, setProject] = useState(initialProject);

  const projectYear = formatYear(project.date);
  const projectMonthYear = formatMonthYear(project.date);

  const handleMediaUpdate = async (medias: { link: string; type: "image" | "video" }[]) => {
    try {
      const response = await fetch(`/api/admin/firebase/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medias }),
      });
      if (!response.ok) throw new Error("Failed to update project medias");
      setProject({ ...project, medias });
      toast.success("Media updated successfully!");
    } catch (error) {
      console.error("Failed to update medias:", error);
      throw error;
    }
  };

  const updateProjectContent = async (projectId: string, content: string) => {
    setProject({ ...project, content });
    if (!isAdmin || !isEditing) return;
    try {
      const res = await fetch(`/api/admin/firebase/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to persist project content");
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden mt-(--nav-h)">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-[560px] h-[560px] rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(64.66% 0.19548 40.184 / 0.10) 0%, transparent 65%)",
            filter: "blur(90px)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <Link
          href="/#Projects"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary transition-colors mb-14 text-sm font-mono tracking-wider uppercase"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Projects
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          <div className="relative rounded-2xl overflow-hidden bg-neutral-900/50 border border-neutral-800/50 flex items-center justify-center p-8">
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(circle at 30% 30%, oklch(64.66% 0.19548 40.184 / 0.06) 0%, transparent 60%)",
              }}
            />
            <EditableImage
              key={`${project.id}-thumbnail`}
              sectionKey={`project-${project.id}`}
              fieldKey="thumbnail"
              src={project.thumbnail}
              collection="projects"
              docId={project.id as string}
              className="relative z-10 max-w-full max-h-[500px] w-auto h-auto object-contain rounded-lg"
            />
          </div>

          <div className="flex flex-col justify-center space-y-8">
            <div>
              <span className="text-primary text-xs font-mono tracking-[0.35em] uppercase mb-4 block">
                <ContentSpan collection="projects" sectionKey={`project-${project.id}`} fieldKey="type">
                  {project.type}
                </ContentSpan>
              </span>
              <ContentSpan
                collection="projects"
                sectionKey={`project-${project.id}`}
                fieldKey="title"
                as="h1"
                className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-none tracking-tight"
              >
                {project.title}
              </ContentSpan>
            </div>

            <ContentSpan
              collection="projects"
              as="p"
              className="text-lg text-neutral-300 leading-relaxed"
              sectionKey={`project-${project.id}`}
              fieldKey="description"
            >
              {project.description}
            </ContentSpan>

            <div className="flex items-center gap-8 py-6 border-t border-b border-neutral-800/60">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs font-mono tracking-widest uppercase text-neutral-600 mb-0.5">Role</p>
                  <ContentSpan
                    collection="projects"
                    as="p"
                    className="text-sm text-neutral-300 font-medium"
                    sectionKey={`project-${project.id}`}
                    fieldKey="role"
                  >
                    {project.role}
                  </ContentSpan>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs font-mono tracking-widest uppercase text-neutral-600 mb-0.5">Year</p>
                  {isEditing ? (
                    <ContentSpan
                      collection="projects"
                      as="p"
                      className="text-sm text-neutral-300 font-medium"
                      sectionKey={`project-${project.id}`}
                      fieldKey="date"
                    >
                      {project.date}
                    </ContentSpan>
                  ) : (
                    <p className="text-sm text-neutral-300 font-medium" title={projectMonthYear}>
                      {projectYear || "N/A"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {!isEditing && project.link ? (
                <Link
                  href={project.link}
                  target="_blank"
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full text-sm font-mono tracking-wider uppercase hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
                >
                  <ExternalLinkIcon className="w-4 h-4" />
                  Live Site
                </Link>
              ) : isEditing ? (
                <div className="space-y-1">
                  <span className="text-xs text-neutral-600 font-mono">Live Link:</span>
                  <ContentSpan collection="projects" sectionKey={`project-${project.id}`} fieldKey="link" className="block px-4 py-2 bg-primary/10 text-primary rounded-full border border-primary/30 text-sm">
                    {project.link || "https://"}
                  </ContentSpan>
                </div>
              ) : null}

              {!isEditing && project.github ? (
                <Link
                  href={project.github}
                  target="_blank"
                  className="flex items-center gap-2 px-6 py-3 border border-neutral-700 text-neutral-300 rounded-full text-sm font-mono tracking-wider uppercase hover:border-primary/50 hover:text-primary transition-all"
                >
                  <GithubIcon className="w-4 h-4" />
                  Source Code
                </Link>
              ) : isEditing ? (
                <div className="space-y-1">
                  <span className="text-xs text-neutral-600 font-mono">GitHub Link:</span>
                  <ContentSpan collection="projects" sectionKey={`project-${project.id}`} fieldKey="github" className="block px-4 py-2 border border-neutral-700 text-neutral-400 rounded-full text-sm">
                    {project.github || "https://"}
                  </ContentSpan>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <ProjectMediaManager
            medias={project.medias || []}
            projectId={project.id as string}
            onUpdate={handleMediaUpdate}
            isEditing={isEditing}
          />

          {project.content && (
            <>
              {isEditing && (
                <div className="flex justify-end">
                  <ProjectContentEditor
                    projectId={project.id as string}
                    content={project.content}
                    onSave={(content) => updateProjectContent(project.id as string, content)}
                  />
                </div>
              )}
              <div className="prose prose-invert prose-lg max-w-none border-t border-neutral-800/60 pt-12">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content}</ReactMarkdown>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}