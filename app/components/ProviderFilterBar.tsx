"use client";

import Link from "next/link";
import { PlayCircle } from "lucide-react";

type Props = {
  activeProvider?: string;
};

const PROVIDERS = [
  { name: "Netflix", color: "hover:border-red-500/50 hover:text-red-400", active: "bg-red-600 text-white border-red-500" },
  { name: "Disney+ Hotstar", color: "hover:border-blue-500/50 hover:text-blue-300", active: "bg-blue-600 text-white border-blue-400" },
  { name: "Prime Video", color: "hover:border-sky-500/50 hover:text-sky-300", active: "bg-sky-500 text-white border-sky-400" },
  { name: "HBO GO", color: "hover:border-purple-500/50 hover:text-purple-300", active: "bg-purple-600 text-white border-purple-400" },
  { name: "Viu", color: "hover:border-yellow-500/50 hover:text-yellow-300", active: "bg-yellow-500 text-black font-semibold border-yellow-400" },
  { name: "TrueID", color: "hover:border-rose-500/50 hover:text-rose-300", active: "bg-rose-600 text-white border-rose-400" },
];

export default function ProviderFilterBar({ activeProvider }: Props) {
  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-10 mt-6">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
        <div className="flex items-center gap-2 pr-3 border-r border-white/10 text-xs font-semibold text-[#E8A33D]">
          <PlayCircle className="h-4 w-4" />
          <span className="hidden sm:inline">เลือกตามแพลตฟอร์ม:</span>
        </div>

        <Link
          href="/"
          className={`rounded-xl border px-3 py-1.5 text-xs transition-all ${
            !activeProvider
              ? "border-[#E8A33D] bg-[#E8A33D]/20 font-medium text-[#E8A33D]"
              : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          ทั้งหมด
        </Link>

        {PROVIDERS.map((p) => {
          const isSelected = activeProvider === p.name;
          return (
            <Link
              key={p.name}
              href={isSelected ? "/" : `/?provider=${encodeURIComponent(p.name)}`}
              className={`rounded-xl border px-3 py-1.5 text-xs transition-all ${
                isSelected
                  ? p.active
                  : `border-white/10 bg-white/5 text-white/70 ${p.color} hover:bg-white/10`
              }`}
            >
              {p.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
