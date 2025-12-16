import { DocumentData, Query, getDocs } from "firebase/firestore";
import { projectsCollection } from "../config";

export interface Project {
  id: string;
}

export async function index(query?: Query): Promise<Project[]> {
  let querySnapshot = null;

  if (query) {
    querySnapshot = await getDocs(query);
  } else {
    querySnapshot = await getDocs(projectsCollection);
  }

  const localProjects = querySnapshot.docs.map((doc: DocumentData) => {
    return { ...doc.data(), id: doc.id };
  });

  return localProjects as Project[];
}
