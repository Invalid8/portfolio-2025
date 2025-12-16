"use client";

import { useEffect, useState } from "react";

export default function useDbFetch<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);

    try {
      setData(await fetcher());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return {
    data,
    loading,
    error,
    isEmpty: Array.isArray(data) ? data.length === 0 : false,
    refetch: fetch,
  };
}
