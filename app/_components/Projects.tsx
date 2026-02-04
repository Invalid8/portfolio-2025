"use client";

import { useState, useEffect } from "react";
import ContentSpan from "@/components/customs/ContentEditSpan";
import EditableImage from "@/components/customs/EditableImage";
import { useAuth } from "@/lib/context/auth";
import { usePageContext } from "@/lib/context/PageContent";
import { fetchCollectionClient } from "@/lib/firebase/services";
import type { Project } from "@/types";
import { ExternalLinkIcon, GithubIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function Projects() {
  const { setSection } = usePageContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await fetchCollectionClient<Project>("projects");
      setProjects(data);

      data.forEach((project) => {
        setSection(`project-${project.id}`, {
          ...project,
          collection: "projects",
          id: project.id as string,
        });
      });
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div id="Projects" className="min-h-svh w-full fij">
        <div className="animate-pulse text-2xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <>
      <div id="Projects" className="min-h-svh w-full py-20 px-5 md:px-10">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Header */}
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-6xl font-bold">
              <ContentSpan sectionKey="projects-header" fieldKey="title">
                SELECTED WORKS
              </ContentSpan>
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl">
              <ContentSpan sectionKey="projects-header" fieldKey="subtitle">
                A showcase of projects where creativity meets functionality.
              </ContentSpan>
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[280px]">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}

function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
  // Create interesting bento layout patterns
  const getGridSpan = (idx: number) => {
    const patterns = [
      "md:col-span-2 md:row-span-2", // Large
      "md:col-span-1 md:row-span-1", // Small
      "md:col-span-1 md:row-span-1", // Small
      "md:col-span-1 md:row-span-2", // Tall
      "md:col-span-2 md:row-span-1", // Wide
      "md:col-span-1 md:row-span-1", // Small
    ];
    return patterns[idx % patterns.length];
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-2xl bg-neutral-800 border border-neutral-700/50 hover:border-primary/30 transition-all",
        getGridSpan(index),
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      </div>

      {/* Content */}
      <div className="relative h-full p-6 flex flex-col justify-end">
        {/* Type Badge */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium uppercase tracking-wider backdrop-blur">
            {project.type}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl lg:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        {/* Description - Show on larger cards */}
        <p className="text-sm text-neutral-300 line-clamp-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {project.description}
        </p>

        {/* Links */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {project.link && (
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur rounded-lg text-xs flex items-center gap-1">
              <ExternalLinkIcon className="w-3 h-3" />
              Live
            </div>
          )}
          {project.github && (
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur rounded-lg text-xs flex items-center gap-1">
              <GithubIcon className="w-3 h-3" />
              Code
            </div>
          )}
        </div>
      </div>

      {/* Project Number */}
      <div className="absolute top-4 right-4 text-6xl font-bold text-white/5 select-none">
        {String(index + 1).padStart(2, "0")}
      </div>
    </div>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const { isEditing } = useAuth();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-2xl border border-neutral-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-neutral-800/80 backdrop-blur rounded-full hover:bg-neutral-700 transition-colors"
        >
          <XIcon className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
          {/* Image/Media Section */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-800">
              <EditableImage
                sectionKey={`project-${project.id}`}
                fieldKey="thumbnail"
                src={project.thumbnail}
                collection="projects"
                docId={project.id as string}
                className="w-full h-full"
              />
            </div>

            {/* Links */}
            <div className="flex gap-3">
              {project.link && (
                <Link
                  href={project.link}
                  target="_blank"
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <ExternalLinkIcon className="w-4 h-4" />
                  Visit Live Site
                </Link>
              )}
              {project.github && (
                <Link
                  href={project.github}
                  target="_blank"
                  className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <GithubIcon className="w-4 h-4" />
                  View Code
                </Link>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Type Badge */}
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium uppercase tracking-wider">
                <ContentSpan
                  sectionKey={`project-${project.id}`}
                  fieldKey="type"
                >
                  {project.type}
                </ContentSpan>
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl lg:text-4xl font-bold">
              <ContentSpan
                sectionKey={`project-${project.id}`}
                fieldKey="title"
              >
                {project.title}
              </ContentSpan>
            </h2>

            {/* Description */}
            <p className="text-lg text-neutral-300 leading-relaxed">
              <ContentSpan
                sectionKey={`project-${project.id}`}
                fieldKey="description"
              >
                {project.description}
              </ContentSpan>
            </p>

            {/* Meta Info */}
            <div className="space-y-3 pt-4 border-t border-neutral-700">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Role</span>
                <span className="text-neutral-200 font-medium">
                  <ContentSpan
                    sectionKey={`project-${project.id}`}
                    fieldKey="role"
                  >
                    {project.role}
                  </ContentSpan>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Year</span>
                <span className="text-neutral-200 font-medium">
                  <ContentSpan
                    sectionKey={`project-${project.id}`}
                    fieldKey="date"
                  >
                    {new Date(project.date).getFullYear()}
                  </ContentSpan>
                </span>
              </div>
            </div>

            {/* Full Content (if available) */}
            {project.content && !isEditing && (
              <div className="prose prose-invert max-w-none pt-6 border-t border-neutral-700">
                <div
                  dangerouslySetInnerHTML={{
                    __html: project.content.replace(/\n/g, "<br />"),
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Projects;
