import { ProjectModalWrapper } from "@/components/customs/sections/ProjectModalWrapper";
import { getProjectById } from "@/lib/firebase/projects";

export default async function InterceptedProjectModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return null;
  }

  return <ProjectModalWrapper project={project} projectId={id} />;
}
