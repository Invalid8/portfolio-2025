import { DocumentData, Query, getDocs } from "firebase/firestore";
import { meCollection } from "../config";

export interface Me {
  id: string;
  name: string;
  app: string;
  ver: string;
}

export async function index(query?: Query): Promise<Me> {
  let querySnapshot = null;

  if (query) {
    querySnapshot = await getDocs(query);
  } else {
    querySnapshot = await getDocs(meCollection);
  }

  const localMes = querySnapshot.docs.map((doc: DocumentData) => {
    return { ...doc.data(), id: doc.id };
  });

  return localMes?.[0] as Me;
}
