"use client";

import { useRouter } from "next/navigation";

const moodPresets = [
  { label: "😴 เหงาอยากดูหนังอบอุ่นใจ", query: "ครอบครัวอบอุ่นใจ" },
  { label: "💥 อยากลุ้นระทึกใจ", query: "ซูเปอร์ฮีโร่ต่อสู้ตื่นเต้น" },
  { label: "😂 อยากดูหนังฮาๆ", query: "ตลกสนุกสนาน" },
  { label: "👻 กล้าดูหนังผีไหม", query: "ผีเหนือธรรมชาติ" },
  { label: "🚀 อยากไปอวกาศ", query: "อวกาศมนุษย์ต่างดาว" },
  { label: "🥊 อยากดูวายร้ายปะทะฮีโร่", query: "ซูเปอร์ฮีโร่วายร้ายแก้แค้น" },
];

export default function MoodChips() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {moodPresets.map((preset) => (
        <button
          key={preset.label}
          onClick={() => router.push(`/search?q=${encodeURIComponent(preset.query)}`)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-[#E8A33D] hover:text-[#E8A33D]"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}