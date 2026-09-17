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
      <p className="mt-2 max-w-2xl mx-auto text-[11px] leading-relaxed text-white/25">
        ข้อความปฏิเสธความรับผิดชอบ: Doo Arai Dee เป็นเว็บไซต์แนะนำภาพยนตร์ ดรรชนีค้นหา และชี้เป้าลิงก์รับชมถูกลิขสิทธิ์เท่านั้น ไม่ใช่บริการสตรีมมิ่งวิดีโอ และไม่มีความเกี่ยวข้องหรือแอบอ้างเป็นผู้ให้บริการอย่างเป็นทางการของ Netflix, Disney+, Prime Video, HBO GO หรือค่ายใดๆ บัญชีสมาชิกใช้สำหรับเข้าสู่ระบบภายในเว็บนี้เท่านั้น
      </p>
      <p className="mt-1 text-[10px] text-white/20">
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </footer>
  );
}