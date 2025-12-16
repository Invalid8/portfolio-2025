import { DocumentData, Query, getDocs } from "firebase/firestore";
import { blogsCollection } from "../config";

export interface Blog {
  id: string;
}

export async function index(query?: Query): Promise<Blog[]> {
  let querySnapshot = null;

  if (query) {
    querySnapshot = await getDocs(query);
  } else {
    querySnapshot = await getDocs(blogsCollection);
  }

  const localBlogs = querySnapshot.docs.map((doc: DocumentData) => {
    return { ...doc.data(), id: doc.id };
  });

  return localBlogs as Blog[];
}
