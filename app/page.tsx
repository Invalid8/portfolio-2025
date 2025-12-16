import Home from "./Home";
import { fetchCollectionServer } from "@/lib/firebase/server/services";

async function page() {
  const me = await fetchCollectionServer("me");

  console.log("server me: ", me);
  return <Home />;
}

export default page;
