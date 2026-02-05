"use client";

import { useRouter } from "next/navigation";
import { ProjectModal } from "../cards/ProjectDetailsModal";
import { usePageContext } from "@/lib/context/PageContent";
import { Project, Section } from "@/types";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/auth";

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

export function ProjectModalWrapper({
  project: initialProject,
  projectId,
}: {
  project: Project;
  projectId: string;
}) {
  const router = useRouter();
  const { sections, setSection } = usePageContext();
  const { isAdmin, isEditing } = useAuth();
  const [currentProject, setCurrentProject] = useState(initialProject);
  const [isNavigating, setIsNavigating] = useState(false);

  const projectsCollection = useMemo(
    () => sections["projects"] || {},
    [sections],
  );

  const projects = useMemo(
    () => Object.values(projectsCollection).filter(isProject),
    [projectsCollection],
  );

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === projectId);
    if (foundProject) {
      setCurrentProject(foundProject);
    }
  }, [projectId, projects]);

  const handleNavigate = async (newProject: Project) => {
    setIsNavigating(true);

    const currentIndex = projects.findIndex((p) => p.id === newProject.id);
    const nextProject = projects[currentIndex + 1];
    const prevProject = projects[currentIndex - 1];

    if (nextProject) {
      fetch(`/api/projects/${nextProject.id}`).catch(() => {});
    }
    if (prevProject) {
      fetch(`/api/projects/${prevProject.id}`).catch(() => {});
    }

    try {
      const response = await fetch(`/api/projects/${newProject.id}`);
      if (!response.ok) throw new Error("Failed to fetch project");

      const projectData = await response.json();
      setCurrentProject(projectData);

      window.history.replaceState(null, "", `/project/${newProject.id}`);
    } catch (error) {
      console.error("Failed to navigate:", error);
      toast.error("Failed to load project");
    } finally {
      setIsNavigating(false);
    }
  };
  const handleClose = () => {
    router.push("/#Projects");
  };

  const updateProjectContent = async (projectId: string, content: string) => {
    const sectionKey = `project-${projectId}`;

    setSection("projects", sectionKey, {
      ...projectsCollection[sectionKey],
      content,
    });

    setCurrentProject({ ...currentProject, content });

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
    <>
      {isNavigating && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      )}
      <ProjectModal
        project={currentProject}
        projects={projects}
        onClose={handleClose}
        onNavigate={handleNavigate}
        onUpdateContent={updateProjectContent}
      />
    </>
  );
}
