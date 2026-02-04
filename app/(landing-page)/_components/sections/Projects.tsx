"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import ContentSpan from "@/components/customs/ContentEditSpan";
import { usePageContext } from "@/lib/context/PageContent";
import { useAuth } from "@/lib/context/auth";
import { Project, Section } from "@/types";
import { AddProjectModal } from "@/components/modals/AddNewItemModals";

import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ProjectCard } from "../cards/ProjectCard";
import { PlusIcon } from "lucide-react";
import { ProjectModal } from "../cards/ProjectModal";
import { toast } from "sonner";

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
  const { sections, setSection } = usePageContext();
  const { isAdmin, isEditing } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const projectsCollection = useMemo(
    () => sections["projects"] || {},
    [sections],
  );

  useEffect(() => {
    const projectList = Object.values(projectsCollection).filter(isProject);
    setProjects(projectList);
  }, [projectsCollection]);

  useEffect(() => {
    if (containerRef.current && projects.length) {
      const cards = containerRef.current.querySelectorAll(".project-card");

      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        },
      );
    }
  }, [projects]);

  const handleAddProject = async (projectData: Partial<Project>) => {
    try {
      const response = await fetch("/api/admin/firebase/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) throw new Error("Failed to add project");

      const newProject: Project = await response.json();

      setSection("projects", `project-${newProject.id}`, {
        ...newProject,
        collection: "projects",
        id: String(newProject.id),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error adding project:", error);
      throw error;
    }
  };

  const updateProjectContent = async (projectId: string, content: string) => {
    const sectionKey = `project-${projectId}`;

    setSection("projects", sectionKey, {
      ...projectsCollection[sectionKey],
      content,
    });

    setSelectedProject((prev) =>
      prev && prev.id === projectId ? { ...prev, content } : prev,
    );

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.toString());
      console.error("updateProjectContent failed:", err);
    }
  };

  const featuredProjects = projects.slice(0, 4);
  const displayedProjects = showAllProjects ? projects : featuredProjects;

  if (!projects.length) {
    return (
      <div
        id="Projects"
        className="min-h-svh w-full flex justify-center items-center"
      >
        <div className="animate-pulse text-2xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <>
      <section
        id="Projects"
        className="min-h-svh w-full py-20 px-5 md:px-10 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="space-y-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-4xl lg:text-6xl font-bold">
                <ContentSpan sectionKey="projects-header" fieldKey="title">
                  SELECTED WORKS
                </ContentSpan>
              </h2>
              <p className="text-lg text-neutral-400 max-w-2xl mt-4">
                <ContentSpan sectionKey="projects-header" fieldKey="subtitle">
                  A showcase of projects where creativity meets functionality.
                </ContentSpan>
              </p>
            </div>

            {isAdmin && isEditing && (
              <AddProjectModal onAdd={handleAddProject} />
            )}
          </div>

          <div
            ref={containerRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            {displayedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>

          {projects.length > 4 && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="group flex items-center gap-3 px-8 py-4 bg-neutral-800/50 backdrop-blur border border-neutral-700/50 rounded-full hover:border-primary/50 hover:bg-neutral-800/70 transition-all"
              >
                <PlusIcon
                  className={cn(
                    "w-5 h-5 transition-transform",
                    showAllProjects && "rotate-45",
                  )}
                />
                <span className="font-medium">
                  {showAllProjects
                    ? "Show Less"
                    : `View All Projects (${projects.length})`}
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          projects={projects}
          onClose={() => setSelectedProject(null)}
          onNavigate={(project) => setSelectedProject(project)}
          onUpdateContent={(id, content) => updateProjectContent(id, content)}
        />
      )}
    </>
  );
}
