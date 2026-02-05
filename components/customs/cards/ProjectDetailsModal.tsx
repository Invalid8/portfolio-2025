import ContentSpan from "@/components/customs/ContentEditSpan";
import EditableImage from "@/components/customs/EditableImage";
import { ProjectMediaManager } from "@/components/customs/ProjectMediaManager";
import { Project } from "@/types";
import {
  ExternalLinkIcon,
  GithubIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import gsap from "gsap";
import { ProjectContentEditor } from "@/components/customs/MarkdownEditor";
import { useAuth } from "@/lib/context/auth";
import { formatMonthYear, formatYear } from "@/utils/dateFormatter";
import { toast } from "sonner";

export function ProjectModal({
  project,
  projects,
  onClose,
  onNavigate,
  onUpdateContent,
}: {
  project: Project;
  projects: Project[];
  onClose: () => void;
  onNavigate: (project: Project) => void;
  onUpdateContent: (projectId: string, content: string) => Promise<void>;
}) {
  const { isEditing } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const isAnimating = useRef(false);
  const previousProjectId = useRef(project.id);

  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < projects.length - 1;

  const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

  const projectYear = formatYear(project.date);
  const projectMonthYear = formatMonthYear(project.date);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    if (modalRef.current && isInitialMount.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
      );
      isInitialMount.current = false;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrevious && !isAnimating.current) {
        onNavigate(projects[currentIndex - 1]);
      }
      if (e.key === "ArrowRight" && hasNext && !isAnimating.current) {
        onNavigate(projects[currentIndex + 1]);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, currentIndex, hasPrevious, hasNext, projects, onNavigate]);

  useEffect(() => {
    if (previousProjectId.current === project.id) {
      return;
    }

    previousProjectId.current = project.id;

    if (!isInitialMount.current && imageRef.current && contentRef.current) {
      if (!isDesktop()) return;

      const scrollContainer = contentRef.current;

      if (isAnimating.current) return;

      isAnimating.current = true;
      scrollContainer.scrollTop = 0;
      scrollContainer.style.overflowY = "hidden";

      const tl = gsap.timeline({
        onComplete: () => {
          scrollContainer.style.overflowY = "auto";
          isAnimating.current = false;
        },
      });

      tl.to(
        imageRef.current,
        {
          opacity: 0,
          y: -30,
          duration: 0.25,
          ease: "power2.in",
        },
        0,
      )
        .to(
          contentRef.current,
          {
            opacity: 0,
            y: 30,
            duration: 0.25,
            ease: "power2.in",
          },
          0,
        )
        .set([imageRef.current, contentRef.current], { y: 0 })
        .set(imageRef.current, { y: 30 })
        .set(contentRef.current, { y: -30 })
        .to(imageRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
        })
        .to(
          contentRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
          },
          "<",
        );
    }
  }, [project.id]);

  const handlePrevious = () => {
    if (hasPrevious && !isAnimating.current) {
      onNavigate(projects[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && !isAnimating.current) {
      onNavigate(projects[currentIndex + 1]);
    }
  };

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

      toast.success("Media updated successfully!");
    } catch (error) {
      console.error("Failed to update medias:", error);
      throw error;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {hasPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="fixed top-1/2 -translate-y-1/2 left-8 z-[10000] p-4 bg-neutral-800/90 backdrop-blur rounded-full hover:bg-neutral-700 transition-all hover:scale-110 hidden lg:flex"
          title="Previous Project (←)"
        >
          <ChevronLeftIcon className="w-8 h-8" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="fixed top-1/2 -translate-y-1/2 right-8 z-[10000] p-4 bg-neutral-800/90 backdrop-blur rounded-full hover:bg-neutral-700 transition-all hover:scale-110 hidden lg:flex"
          title="Next Project (→)"
        >
          <ChevronRightIcon className="w-8 h-8" />
        </button>
      )}

      <Link
        href="/#Projects"
        onClick={onClose}
        className="fixed top-8 right-8 z-[10000] p-3 bg-neutral-800/90 backdrop-blur rounded-full hover:bg-neutral-700 transition-colors"
        title="Close (Esc)"
      >
        <XIcon className="w-6 h-6" />
      </Link>

      <div
        ref={modalRef}
        className="relative w-full max-w-7xl sm:h-[90vh] h-screen bg-neutral-900 sm:rounded-2xl border border-neutral-700 shadow-2xl flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={imageContainerRef}
          className="relative bg-neutral-950 flex items-center justify-center p-6 sm:p-8 lg:p-12 lg:w-1/2 lg:h-full w-full min-h-[40vh] sm:min-h-[50vh] lg:min-h-0 lg:flex-shrink-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900/50 to-neutral-950 z-0"></div>
          <div
            ref={imageRef}
            className="relative z-10 flex items-center justify-center w-full h-full"
          >
            <EditableImage
              key={`${project.id}-thumbnail`}
              sectionKey={`project-${project.id}`}
              fieldKey="thumbnail"
              src={project.thumbnail}
              collection="projects"
              docId={project.id as string}
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>

        <div className="lg:w-1/2 flex-1 flex flex-col overflow-visible">
          <div
            ref={contentRef}
            className="flex-1 p-6 sm:p-8 lg:p-12 space-y-6 overflow-visible lg:overflow-y-auto"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium uppercase tracking-wider mb-6">
                <ContentSpan
                  sectionKey={`project-${project.id}`}
                  fieldKey="type"
                >
                  {project.type}
                </ContentSpan>
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold">
              <ContentSpan
                sectionKey={`project-${project.id}`}
                fieldKey="title"
              >
                {project.title}
              </ContentSpan>
            </h2>

            <p className="text-xl text-neutral-300 leading-relaxed">
              <ContentSpan
                sectionKey={`project-${project.id}`}
                fieldKey="description"
              >
                {project.description}
              </ContentSpan>
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6 pb-8 border-y border-neutral-700">
              <div>
                <span className="text-neutral-500 text-sm">Role</span>
                <p className="text-neutral-200 font-medium mt-1">
                  <ContentSpan
                    sectionKey={`project-${project.id}`}
                    fieldKey="role"
                  >
                    {project.role}
                  </ContentSpan>
                </p>
              </div>
              <div>
                <span className="text-neutral-500 text-sm">Completed</span>
                <p
                  className="text-neutral-200 font-medium mt-1"
                  title={projectMonthYear}
                >
                  {projectYear || "N/A"}
                </p>
              </div>
            </div>

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
                        onUpdateContent(project.id as string, content)
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

            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              {project.link && (
                <Link
                  href={project.link}
                  target="_blank"
                  className="flex-1 px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <ExternalLinkIcon className="w-5 h-5" />
                  Visit Live Site
                </Link>
              )}
              {project.github && (
                <Link
                  href={project.github}
                  target="_blank"
                  className="flex-1 px-6 py-4 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <GithubIcon className="w-5 h-5" />
                  View Code
                </Link>
              )}
            </div>

            <div className="flex lg:hidden gap-4 pt-4 pb-8">
              <button
                onClick={handlePrevious}
                disabled={!hasPrevious}
                className="flex-1 px-6 py-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="flex-1 px-6 py-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
