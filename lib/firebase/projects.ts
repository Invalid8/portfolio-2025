import { Project } from "@/types";
import { fetchByIdServer } from "./server/services";
import { serializeFirestoreData } from "../serialize";

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const projectData = await fetchByIdServer<Project>("projects", id);

    if (!projectData) {
      return null;
    }

    return serializeFirestoreData(projectData);
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}
