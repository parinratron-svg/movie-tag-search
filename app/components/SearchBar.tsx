"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative hidden md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="อยากดูหนังแบบไหน..."
        className="w-56 rounded-full border border-white/10 bg-white/5 py-1.5 pl-9 pr-3 text-sm text-[#F5F1E8] outline-none transition-all placeholder:text-white/30 focus:w-72 focus:border-[#E8A33D]/60"
      />
    </form>
  );
}