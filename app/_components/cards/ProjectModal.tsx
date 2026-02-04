import ContentSpan from "@/components/customs/ContentEditSpan";
import EditableImage from "@/components/customs/EditableImage";
import { Project } from "@/types";
import { ExternalLinkIcon, GithubIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

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
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-2xl border border-neutral-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right z-10 p-3 bg-neutral-800/80 backdrop-blur rounded-full hover:bg-neutral-700 transition-colors"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <div className="p-8 lg:p-12">
          <div className="aspect-video rounded-xl overflow-hidden bg-neutral-800 mb-8">
            <EditableImage
              sectionKey={`project-${project.id}`}
              fieldKey="thumbnail"
              src={project.thumbnail}
              collection="projects"
              docId={project.id as string}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
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
