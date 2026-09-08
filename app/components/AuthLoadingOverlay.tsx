import { Clapperboard } from "lucide-react";

export default function AuthLoadingOverlay() {
  return (
    <div className="animate-overlay-fade-out fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#0F1115]">
      {/* radial glow ขยายจากตรงกลาง */}
      <div className="animate-bg-glow absolute h-[600px] w-[600px] rounded-full bg-[#E8A33D] blur-[100px]" />

      <div className="animate-logo-reveal relative flex flex-col items-center gap-4">
        <span className="animate-icon-glow flex h-16 w-16 items-center justify-center rounded-full bg-[#E8A33D]/15 text-[#E8A33D]">
          <Clapperboard className="h-8 w-8" />
        </span>

        <div className="relative overflow-hidden">
          <span className="font-serif text-4xl tracking-tight text-[#F5F1E8]">
            Doo Arai Dee
          </span>
          {/* เส้นแสงวิ่งผ่านข้อความ */}
          <span className="animate-shine-sweep pointer-events-none absolute inset-0 block w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      </div>
    </div>
  );
}