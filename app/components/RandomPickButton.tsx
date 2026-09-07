"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";

export default function RandomPickButton({
  label = "สุ่มให้หน่อย",
}: {
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/random");
    setLoading(false);

    if (!res.ok) return;

    const data = await res.json();
    router.push(`/movies/${data.id}`);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-[#E8A33D] hover:text-[#E8A33D] disabled:opacity-50"
    >
      <Shuffle className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "กำลังสุ่ม..." : label}
    </button>
  );
}