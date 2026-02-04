import ContentSpan from "@/components/customs/ContentEditSpan";
import EditableImage from "@/components/customs/EditableImage";
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

export function ProjectModal({
  project,
  projects,
  onClose,
  onNavigate,
}: {
  project: Project;
  projects: Project[];
  onClose: () => void;
  onNavigate: (project: Project) => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < projects.length - 1;

  useEffect(() => {
    document.body.style.overflow = "hidden";

    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
      );
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrevious) {
        onNavigate(projects[currentIndex - 1]);
      }
      if (e.key === "ArrowRight" && hasNext) {
        onNavigate(projects[currentIndex + 1]);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, currentIndex, hasPrevious, hasNext, projects, onNavigate]);

  const handlePrevious = () => {
    if (hasPrevious) {
      onNavigate(projects[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onNavigate(projects[currentIndex + 1]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-2xl border border-neutral-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-neutral-800/80 backdrop-blur rounded-full hover:bg-neutral-700 transition-colors"
        >
          <XIcon className="w-6 h-6" />
        </button>

        {hasPrevious && (
          <button
            onClick={handlePrevious}
            className="absolute top-1/2 -translate-y-1/2 left-4 z-10 p-3 bg-neutral-800/80 backdrop-blur rounded-full hover:bg-neutral-700 transition-colors hidden lg:flex"
            title="Previous Project"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        )}

        {hasNext && (
          <button
            onClick={handleNext}
            className="absolute top-1/2 -translate-y-1/2 right-4 z-10 p-3 bg-neutral-800/80 backdrop-blur rounded-full hover:bg-neutral-700 transition-colors hidden lg:flex"
            title="Next Project"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        )}

        <div className="grid lg:grid-cols-2 gap-0">
          <div className="lg:sticky lg:top-0 lg:h-[90vh] bg-neutral-800">
            <EditableImage
              sectionKey={`project-${project.id}`}
              fieldKey="thumbnail"
              src={project.thumbnail}
              collection="projects"
              docId={project.id as string}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8 lg:p-12 space-y-6">
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
                <span className="text-neutral-500 text-sm">Year</span>
                <p className="text-neutral-200 font-medium mt-1">
                  <ContentSpan
                    sectionKey={`project-${project.id}`}
                    fieldKey="date"
                  >
                    {new Date(project.date).getFullYear()}
                  </ContentSpan>
                </p>
              </div>
            </div>

            {project.content && (
              <ProjectModalContent content={project.content} />
            )}

            <div className="flex gap-4 pt-8">
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

            <div className="flex lg:hidden gap-4 pt-4">
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

function ProjectModalContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-h2:text-primary prose-h3:text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
