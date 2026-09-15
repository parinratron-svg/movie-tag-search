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

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    card.style.setProperty("--tilt-x", `${y * -3}deg`);
    card.style.setProperty("--tilt-y", `${x * 3}deg`);
    card.style.setProperty("--spot-x", `${(x + 0.5) * 100}%`);
    card.style.setProperty("--spot-y", `${(y + 0.5) * 100}%`);
  }

  function resetPointer(card: HTMLButtonElement) {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--spot-x", "50%");
    card.style.setProperty("--spot-y", "50%");
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {moodPresets.map((preset) => (
        <button
          key={preset.label}
          onClick={() => router.push(`/search?q=${encodeURIComponent(preset.query)}`)}
          onPointerMove={handlePointerMove}
          onPointerLeave={(event) => resetPointer(event.currentTarget)}
          className="group relative flex min-h-18 items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-black/15 p-4 text-left shadow-lg shadow-black/10 transition duration-300 [transform:perspective(700px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] hover:border-[#E8A33D]/50 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-black/20 motion-reduce:[transform:none]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(232, 163, 61, 0.16), transparent 34%)",
            }}
          />
          <span
            className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${preset.color}`}
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