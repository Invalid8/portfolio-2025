"use client";

import { useRouter } from "next/navigation";
import { ProjectModal } from "../cards/ProjectDetailsModal";
import { usePageContext } from "@/lib/context/PageContent";
import { Project, Section } from "@/types";
import { useMemo, useState, useEffect, useCallback } from "react";
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

const projectCache = new Map<string, Project>();

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

  useEffect(() => {
    projectCache.set(projectId, initialProject);
  }, [projectId, initialProject]);

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

  const handleNavigate = useCallback(
    async (newProject: Project) => {
      setIsNavigating(true);

      const currentIndex = projects.findIndex((p) => p.id === newProject.id);
      const nextProject = projects[currentIndex + 1];
      const prevProject = projects[currentIndex - 1];

      if (nextProject && !projectCache.has(String(nextProject.id))) {
        fetch(`/api/projects/${nextProject.id}`)
          .then((res) => res.json())
          .then((data) => projectCache.set(String(nextProject.id), data))
          .catch(() => {});
      }
      if (prevProject && !projectCache.has(String(prevProject.id))) {
        fetch(`/api/projects/${prevProject.id}`)
          .then((res) => res.json())
          .then((data) => projectCache.set(String(prevProject.id), data))
          .catch(() => {});
      }

      try {
        const cached = projectCache.get(String(newProject.id));
        if (cached) {
          setCurrentProject(cached);
          window.history.replaceState(null, "", `/project/${newProject.id}`);
          setIsNavigating(false);
          return;
        }

        const response = await fetch(`/api/projects/${newProject.id}`);
        if (!response.ok) throw new Error("Failed to fetch project");

        const projectData = await response.json();
        projectCache.set(String(newProject.id), projectData);
        setCurrentProject(projectData);

        window.history.replaceState(null, "", `/project/${newProject.id}`);
      } catch (error) {
        console.error("Failed to navigate:", error);
        toast.error("Failed to load project");
      } finally {
        setIsNavigating(false);
      }
    },
    [projects],
  );

  const handleClose = useCallback(() => {
    router.push("/#Projects", { scroll: false });
  }, [router]);

  const updateProjectContent = useCallback(
    async (projectId: string, content: string) => {
      const sectionKey = `project-${projectId}`;

      setSection("projects", sectionKey, {
        ...projectsCollection[sectionKey],
        content,
      });

      setCurrentProject((prev) => ({ ...prev, content }));

      const cached = projectCache.get(projectId);
      if (cached) {
        projectCache.set(projectId, { ...cached, content });
      }

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
    },
    [projectsCollection, isAdmin, isEditing, setSection],
  );

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
