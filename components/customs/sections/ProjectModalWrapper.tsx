"use client";

import { useRouter, usePathname } from "next/navigation";
import { ProjectModal } from "../cards/ProjectDetailsModal";
import { usePageContext } from "@/lib/context/PageContent";
import { Project, Section } from "@/types";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
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
  const pathname = usePathname();
  const { sections, setSection } = usePageContext();
  const { isAdmin, isEditing } = useAuth();
  const [currentProject, setCurrentProject] = useState(initialProject);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const closeTimeoutRef = useRef<NodeJS.Timeout>(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    projectCache.set(projectId, initialProject);
    scrollPositionRef.current = window.scrollY;
  }, [projectId, initialProject]);

  useEffect(() => {
    if (pathname === "/" || !pathname.startsWith("/project/")) {
      setIsOpen(false);
    } else if (pathname.startsWith("/project/")) {
      setIsOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      setIsOpen(false);
      document.body.style.overflow = "";
    };
  }, []);

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
    setIsOpen(false);

    closeTimeoutRef.current = setTimeout(() => {
      router.push("/", { scroll: false });

      setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: "instant",
        });
      }, 50);
    }, 300);
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

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {isNavigating && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
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
