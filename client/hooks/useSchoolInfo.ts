"use client";

import type { SchoolInfo } from "@/lib/types";
import { useEffect, useState } from "react";

type FetchSchoolInfo = () => Promise<SchoolInfo | null>;

type UseSchoolInfoOptions = {
  fetchSchoolInfo: FetchSchoolInfo;
  fallback: SchoolInfo;
};

type UseSchoolInfoResult = {
  schoolInfo: SchoolInfo;
  isLoading: boolean;
  isUsingFallback: boolean;
  error: string;
};

export function useSchoolInfo({ fetchSchoolInfo, fallback }: UseSchoolInfoOptions): UseSchoolInfoResult {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSchoolInfo() {
      try {
        const data = await fetchSchoolInfo();
        if (!active || !data) return;
        setSchoolInfo(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load school information");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadSchoolInfo();
    return () => {
      active = false;
    };
  }, [fetchSchoolInfo]);

  return {
    schoolInfo,
    isLoading,
    isUsingFallback: Boolean(error),
    error,
  };
}

