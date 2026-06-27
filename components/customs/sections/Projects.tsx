"use client";

import { useState, useMemo, useRef } from "react";
import ContentSpan from "@/components/customs/ContentEditSpan";
import { usePageContext } from "@/lib/context/PageContent";
import { useAuth } from "@/lib/context/auth";
import { Project, Section } from "@/types";
import { AddProjectModal } from "@/components/modals";
import { EmptyState } from "@/components/customs/EmptyState";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { RocketIcon, ArrowUpRightIcon, ExternalLinkIcon, GithubIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function isProject(section: Section): section is Section & Project {
  return (
    section &&
    typeof section === "object" &&
    "thumbnail" in section &&
    "title" in section &&
    "description" in section &&
    "medias" in section &&
    Array.isArray(section.medias)
  );
}

export default function Projects() {
  const { items, createItem } = usePageContext();
  const { isAdmin, isEditing } = useAuth();
  const [showAll, setShowAll] = useState(false);

  const projects = useMemo<Project[]>(
    () => (items["projects"] || []).filter(isProject),
    [items],
  );

  const handleAddProject = async (formData: FormData) => {
    try {
      const thumbnailFile = formData.get("thumbnailFile") as File | null;
      let thumbnailUrl = formData.get("thumbnail") as string;
      if (thumbnailFile && thumbnailFile.size > 0) {
        thumbnailUrl = await uploadToCloudinary(thumbnailFile);
      }

      const projectData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        type: formData.get("type") as string,
        role: formData.get("role") as string,
        link: formData.get("link") as string,
        github: formData.get("github") as string,
        date: formData.get("date") as string,
        thumbnail: thumbnailUrl,
        medias: JSON.parse((formData.get("medias") as string) || "[]"),
        content: (formData.get("content") as string) || "",
      };

      await createItem("projects", projectData);
      toast.success("Project added successfully!");
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project");
      throw error;
    }
  };

  const displayed = showAll ? projects : projects.slice(0, 6);

  return (
    <section id="Projects" className="w-full py-20 px-4 sm:px-8 md:px-12 relative">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-end justify-between gap-4 mb-14">
          <div>
            <ContentSpan
              itemId="projects-header"
              fieldKey="title"
              as="h2"
              className="text-4xl lg:text-6xl font-bold"
            >
              SELECTED WORKS
            </ContentSpan>
            <ContentSpan
              itemId="projects-header"
              fieldKey="subtitle"
              as="p"
              className="text-base text-neutral-400 max-w-2xl mt-3"
            >
              A showcase of projects where creativity meets functionality.
            </ContentSpan>
          </div>
          {isAdmin && isEditing && <AddProjectModal onAdd={handleAddProject} />}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No Projects Yet"
            description="Start showcasing your work by adding your first project."
            icon={<RocketIcon className="w-16 h-16 text-neutral-600" strokeWidth={1.5} />}
            action={isAdmin && isEditing ? <AddProjectModal onAdd={handleAddProject} /> : null}
          />
        ) : (
          <>
            <div className="divide-y divide-neutral-800/50">
              {displayed.map((project, i) => (
                <ProjectRow key={project.id} project={project} index={i} />
              ))}
            </div>

            {projects.length > 6 && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-3 px-8 py-3 rounded-full border border-neutral-700 text-sm font-mono tracking-widest uppercase text-neutral-400 hover:text-primary hover:border-primary/50 transition-all"
                >
                  {showAll ? "Show Less" : `All Projects (${projects.length})`}
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const rowRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    setPos({
      x: e.clientX - rect.left + 20,
      y: Math.min(e.clientY - rect.top - 70, rect.height - 10),
    });
  };

  return (
    <Link
      ref={rowRef}
      href={`/project/${project.id}`}
      className="group relative flex items-center gap-5 lg:gap-8 py-5 lg:py-7 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <div
        className="pointer-events-none absolute z-50 w-52 h-32 rounded-xl overflow-hidden border border-white/10 shadow-2xl"
        style={{
          left: pos.x,
          top: pos.y,
          opacity: hovered ? 1 : 0,
          transform: hovered ? "scale(1) translateY(0)" : "scale(0.92) translateY(6px)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
      >
        {!imageError && project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
            <RocketIcon className="w-8 h-8 text-neutral-600" />
          </div>
        )}
      </div>

      <span className="hidden sm:block text-xs font-mono text-neutral-700 group-hover:text-primary/60 transition-colors w-7 flex-shrink-0 select-none tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-5">
        <span className="text-xl md:text-2xl lg:text-3xl font-bold group-hover:text-primary transition-colors duration-200 truncate">
          {project.title}
        </span>
        <span className="hidden sm:block h-px flex-1 bg-neutral-800 group-hover:bg-primary/20 transition-colors duration-300" />
        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 group-hover:text-neutral-300 transition-colors flex-shrink-0">
          {project.type}
        </span>
      </div>

      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
        {project.link && (
          <span
            role="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(project.link, "_blank"); }}
            className="p-2 rounded-lg text-neutral-600 hover:text-white hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100"
            title="Live Site"
          >
            <ExternalLinkIcon className="w-4 h-4" />
          </span>
        )}
        {project.github && (
          <span
            role="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(project.github, "_blank"); }}
            className="p-2 rounded-lg text-neutral-600 hover:text-white hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100"
            title="GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </span>
        )}
      </div>

      <ArrowUpRightIcon className="w-5 h-5 flex-shrink-0 text-neutral-700 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
    </Link>
  );
}