import { ProjectFullPage } from "@/components/customs/sections/ProjectFullPage";
import { getProjectById } from "@/lib/firebase/projects";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <Link
            href="/#Projects"
            className="text-primary hover:underline flex items-center gap-2 justify-center"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return <ProjectFullPage project={project} />;
}
