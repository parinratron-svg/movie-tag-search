"use client";

import { useRouter } from "next/navigation";

const moodPresets = [
  { emoji: "😴", label: "เหงาอยากดูหนังอบอุ่นใจ", query: "ครอบครัวอบอุ่นใจ", color: "bg-blue-500/15 text-blue-300" },
  { emoji: "💥", label: "อยากลุ้นระทึกใจ", query: "ซูเปอร์ฮีโร่ต่อสู้ตื่นเต้น", color: "bg-red-500/15 text-red-300" },
  { emoji: "😂", label: "อยากดูหนังฮาๆ", query: "ตลกสนุกสนาน", color: "bg-yellow-500/15 text-yellow-300" },
  { emoji: "👻", label: "กล้าดูหนังผีไหม", query: "ผีเหนือธรรมชาติ", color: "bg-purple-500/15 text-purple-300" },
  { emoji: "🚀", label: "อยากไปอวกาศ", query: "อวกาศมนุษย์ต่างดาว", color: "bg-cyan-500/15 text-cyan-300" },
  { emoji: "🥊", label: "อยากดูวายร้ายปะทะฮีโร่", query: "ซูเปอร์ฮีโร่วายร้ายแก้แค้น", color: "bg-orange-500/15 text-orange-300" },
];

export default function MoodChips() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {moodPresets.map((preset) => (
        <button
          key={preset.label}
          onClick={() => router.push(`/search?q=${encodeURIComponent(preset.query)}`)}
          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-[#E8A33D]/50 hover:bg-white/10"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${preset.color}`}
          >
            {preset.emoji}
          </span>
          <span className="text-sm text-white/80 transition-colors group-hover:text-[#F5F1E8]">
            {preset.label}
          </span>
        </button>
      ))}
    </div>
  );
}