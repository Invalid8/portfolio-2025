"use client";

import { Project } from "@/types";
import ContentSpan from "@/components/customs/ContentEditSpan";
import EditableImage from "@/components/customs/EditableImage";
import { ProjectMediaManager } from "@/components/customs/ProjectMediaManager";
import { useAuth } from "@/lib/context/auth";
import { formatMonthYear, formatYear } from "@/utils/dateFormatter";
import Link from "next/link";
import { ExternalLinkIcon, GithubIcon, ArrowLeftIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { ProjectContentEditor } from "@/components/customs/MarkdownEditor";
import { useState } from "react";

export function ProjectFullPage({
  project: initialProject,
}: {
  project: Project;
}) {
  const { isEditing, isAdmin } = useAuth();
  const [project, setProject] = useState(initialProject);

  const projectYear = formatYear(project.date);
  const projectMonthYear = formatMonthYear(project.date);

  const handleMediaUpdate = async (
    medias: { link: string; type: "image" | "video" }[],
  ) => {
    try {
      const response = await fetch(
        `/api/admin/firebase/projects/${project.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medias }),
        },
      );

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

      if (!res.ok) {
        throw new Error("Failed to persist project content");
      }
    } catch (err) {
      toast.error(String(err));
      console.error("updateProjectContent failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white mt-(--nav-h)">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Link
          href="/#Projects"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Projects
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="relative bg-neutral-900 rounded-2xl p-8 flex items-center justify-center">
            <EditableImage
              key={`${project.id}-thumbnail`}
              sectionKey={`project-${project.id}`}
              fieldKey="thumbnail"
              src={project.thumbnail}
              collection="projects"
              docId={project.id as string}
              className="max-w-full max-h-[600px] w-auto h-auto object-contain rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium uppercase tracking-wider mb-4">
                <ContentSpan
                  collection="projects"
                  sectionKey={`project-${project.id}`}
                  fieldKey="type"
                >
                  {project.type}
                </ContentSpan>
              </span>
            </div>

            <ContentSpan
              collection="projects"
              sectionKey={`project-${project.id}`}
              fieldKey="title"
              as="h1"
              className="text-5xl lg:text-6xl font-bold"
            >
              {project.title}
            </ContentSpan>

            <ContentSpan
              collection="projects"
              as="p"
              className="text-xl text-neutral-300 leading-relaxed"
              sectionKey={`project-${project.id}`}
              fieldKey="description"
            >
              {project.description}
            </ContentSpan>

            <div className="grid grid-cols-2 gap-4 pt-6 pb-8 border-y border-neutral-700">
              <div>
                <span className="text-neutral-500 text-sm">Role</span>
                <ContentSpan
                  collection="projects"
                  as="p"
                  className="text-neutral-200 font-medium mt-1"
                  sectionKey={`project-${project.id}`}
                  fieldKey="role"
                >
                  {project.role}
                </ContentSpan>
              </div>
              <div>
                <span className="text-neutral-500 text-sm">Completed</span>
                {isEditing ? (
                  <ContentSpan
                    collection="projects"
                    as="p"
                    className="text-neutral-200 font-medium mt-1"
                    sectionKey={`project-${project.id}`}
                    fieldKey="date"
                  >
                    {project.date}
                  </ContentSpan>
                ) : (
                  <p
                    className="text-neutral-200 font-medium mt-1"
                    title={projectMonthYear}
                  >
                    {projectYear || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!isEditing && project.link ? (
                <Link
                  href={project.link}
                  target="_blank"
                  className="flex-1 px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <ExternalLinkIcon className="w-5 h-5" />
                  Visit Live Site
                </Link>
              ) : isEditing ? (
                <div className="flex-1 space-y-2">
                  <span className="text-sm text-neutral-500">Live Link:</span>
                  <ContentSpan
                    collection="projects"
                    sectionKey={`project-${project.id}`}
                    fieldKey="link"
                    className="block px-6 py-4 bg-primary/10 text-primary rounded-lg border border-primary/30"
                  >
                    {project.link || "https://"}
                  </ContentSpan>
                </div>
              ) : null}

              {!isEditing && project.github ? (
                <Link
                  href={project.github}
                  target="_blank"
                  className="flex-1 px-6 py-4 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <GithubIcon className="w-5 h-5" />
                  View Code
                </Link>
              ) : isEditing ? (
                <div className="flex-1 space-y-2">
                  <span className="text-sm text-neutral-500">GitHub Link:</span>
                  <ContentSpan
                    collection="projects"
                    sectionKey={`project-${project.id}`}
                    fieldKey="github"
                    className="block px-6 py-4 bg-neutral-800/50 text-neutral-300 rounded-lg border border-neutral-700"
                  >
                    {project.github || "https://"}
                  </ContentSpan>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-8">
          <ProjectMediaManager
            medias={project.medias || []}
            projectId={project.id as string}
            onUpdate={handleMediaUpdate}
            isEditing={isEditing}
          />

          {project.content && (
            <>
              <div className="flex justify-end">
                {isEditing && (
                  <ProjectContentEditor
                    projectId={project.id as string}
                    content={project.content}
                    onSave={(content) =>
                      updateProjectContent(project.id as string, content)
                    }
                  />
                )}
              </div>

              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {project.content}
                </ReactMarkdown>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}