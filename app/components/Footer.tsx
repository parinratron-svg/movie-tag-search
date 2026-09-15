import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0F1115] px-6 py-8 text-center sm:px-10">
      <p className="text-xs text-white/40">
        Doo Arai Dee เป็นโปรเจกต์นักศึกษา ไม่ใช่บริการเชิงพาณิชย์
      </p>
      <p className="mt-2 text-xs text-white/30">
        ข้อมูลภาพยนตร์ทั้งหมดขับเคลื่อนโดย{" "}
        <Link
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E8A33D] hover:underline"
        >
          The Movie Database (TMDB)
        </Link>
      </p>
      <p className="mt-1 text-[11px] text-white/20">
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </footer>
  );
}