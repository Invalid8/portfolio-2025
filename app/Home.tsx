"use client";

import { fetchCollectionClient } from "@/lib/firebase/services";
import { Me } from "@/lib/firebase/services/me";
import useDbFetch from "@/lib/hooks/useDbFetch";
import { Loader2 } from "lucide-react";

const meIndex: () => Promise<Me[]> = async () => fetchCollectionClient("me");

function Home() {
  const { data, loading, refetch } = useDbFetch(meIndex);

  console.log("client me: ", data, "loading: ", loading);
  return (
    <div>
      Hi
      <br />
      <br />
      <button onClick={() => refetch()}>Refresh</button>
      <br />
      <br />
      {loading && <Loader2 className="text-blue-500 animate-spin" />}
      {!loading && <p>data: {data?.[0]?.app}</p>}
    </div>
  );
}

export default Home;
