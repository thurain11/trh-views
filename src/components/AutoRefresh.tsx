"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_MS = 60 * 60 * 1000;

export default function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => {
      router.refresh();
    }, REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [router]);

  return null;
}
