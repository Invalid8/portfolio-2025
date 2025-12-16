import { DocumentData, Query, getDocs } from "firebase/firestore";
import { experiencesCollection } from "../config";

export interface Experience {
  id: string;
}

export async function index(query?: Query): Promise<Experience[]> {
  let querySnapshot = null;

  if (query) {
    querySnapshot = await getDocs(query);
  } else {
    querySnapshot = await getDocs(experiencesCollection);
  }

  const localExperiences = querySnapshot.docs.map((doc: DocumentData) => {
    return { ...doc.data(), id: doc.id };
  });

  return localExperiences as Experience[];
}
