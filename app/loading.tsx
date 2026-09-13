import Image from "next/image";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F1115] text-[#F5F1E8]">
      <div className="flex flex-col items-center gap-4 text-sm text-white/60" role="status" aria-live="polite">
        <Image
          src="/uni%20chan.gif"
          alt=""
          width={240}
          height={240}
          priority
          unoptimized
          aria-hidden="true"
        />
        <div className="flex items-center gap-1">
          กำลังโหลด
          <span className="loading-dots" aria-hidden="true">...</span>
        </div>
      </div>
    </main>
  );
}
