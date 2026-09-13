"use client";

import { useEffect, useRef } from "react";

export default function RecordView({ movieId }: { movieId: string }) {
  const hasRecorded = useRef(false);

  useEffect(() => {
    if (hasRecorded.current) return;
    hasRecorded.current = true;

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId }),
    });
  }, [movieId]);

  return null;
}