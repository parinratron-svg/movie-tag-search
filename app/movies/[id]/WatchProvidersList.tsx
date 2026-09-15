"use client";

import { ExternalLink, PlayCircle } from "lucide-react";

type Props = {
  movieId: string;
  watchProviders: string[];
};

type ProviderConfig = {
  name: string;
  bg: string;
  text: string;
  border: string;
  badge: string;
};

const PROVIDER_STYLES: Record<string, ProviderConfig> = {
  Netflix: {
    name: "Netflix",
    bg: "bg-red-600/20 hover:bg-red-600/30",
    text: "text-red-400",
    border: "border-red-600/40",
    badge: "bg-red-600 text-white",
  },
  "Disney+ Hotstar": {
    name: "Disney+ Hotstar",
    bg: "bg-blue-600/20 hover:bg-blue-600/30",
    text: "text-blue-300",
    border: "border-blue-500/40",
    badge: "bg-blue-600 text-white",
  },
  "Prime Video": {
    name: "Prime Video",
    bg: "bg-sky-500/20 hover:bg-sky-500/30",
    text: "text-sky-300",
    border: "border-sky-400/40",
    badge: "bg-sky-500 text-white",
  },
  "HBO GO": {
    name: "HBO GO",
    bg: "bg-purple-600/20 hover:bg-purple-600/30",
    text: "text-purple-300",
    border: "border-purple-500/40",
    badge: "bg-purple-600 text-white",
  },
  Viu: {
    name: "Viu",
    bg: "bg-yellow-500/20 hover:bg-yellow-500/30",
    text: "text-yellow-300",
    border: "border-yellow-400/40",
    badge: "bg-yellow-500 text-black font-bold",
  },
  TrueID: {
    name: "TrueID",
    bg: "bg-rose-500/20 hover:bg-rose-500/30",
    text: "text-rose-300",
    border: "border-rose-400/40",
    badge: "bg-rose-600 text-white",
  },
};

export default function WatchProvidersList({ movieId, watchProviders }: Props) {
  if (!watchProviders || watchProviders.length === 0) {
    return (
      <div className="rounded-lg bg-white/5 p-4 text-xs text-white/50">
        ยังไม่มีข้อมูลช่องทางรับชมอย่างเป็นทางการสำหรับเรื่องนี้
      </div>
    );
  }

  const handleProviderClick = async (providerName: string, url: string) => {
    try {
      fetch("/api/providers/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerName, movieId }),
      });
    } catch (e) {
      console.error("Failed to log click:", e);
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#F5F1E8]">
          <PlayCircle className="h-4 w-4 text-[#E8A33D]" />
          <span>ชี้เป้าช่องทางรับชมถูกลิขสิทธิ์ (Where to Watch)</span>
        </h3>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
          Official Legal Streaming
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {watchProviders.map((entry) => {
          const [name, url] = entry.split("|");
          const style = PROVIDER_STYLES[name] || {
            name,
            bg: "bg-white/10 hover:bg-white/20",
            text: "text-white",
            border: "border-white/20",
            badge: "bg-white/20 text-white",
          };

          return (
            <button
              key={name}
              onClick={() => handleProviderClick(name, url || "#")}
              className={`group flex items-center gap-2.5 rounded-lg border ${style.border} ${style.bg} px-3.5 py-2 text-xs font-medium ${style.text} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm`}
            >
              <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${style.badge}`}>
                {name}
              </span>
              <span>ดูบน {name}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
