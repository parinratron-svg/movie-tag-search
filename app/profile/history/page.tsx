import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Clock, Film } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function formatDateGroup(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (isSameDay(date, today)) return "วันนี้";
  if (isSameDay(date, yesterday)) return "เมื่อวาน";

  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const views = await prisma.viewHistory.findMany({
    where: { userId: user.id },
    include: { movie: true },
    orderBy: { viewedAt: "desc" },
    take: 100,
  });

  const seen = new Set<string>();
  const uniqueViews = views.filter((v) => {
    if (seen.has(v.movieId)) return false;
    seen.add(v.movieId);
    return true;
  });

  // คำนวณ genre ที่ดูบ่อยที่สุด สำหรับ badge สรุป
  const genreCount = new Map<string, number>();
  uniqueViews.forEach((v) =>
    v.movie.genres.forEach((g) => genreCount.set(g, (genreCount.get(g) ?? 0) + 1))
  );
  const topGenre = Array.from(genreCount.entries()).sort((a, b) => b[1] - a[1])[0];

  // จัดกลุ่มตามวันที่
  const groups = new Map<string, typeof uniqueViews>();
  for (const view of uniqueViews) {
    const key = formatDateGroup(new Date(view.viewedAt));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(view);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F1115] text-[#F5F1E8]">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-[#E8A33D]/[0.06] blur-[130px]" />

      <div className="relative mx-auto max-w-5xl px-6 py-12 sm:px-10">
        <p className="text-sm text-[#E8A33D]">โปรไฟล์ของคุณ</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl">ประวัติการดู</h1>

        {/* สรุปสถิติ */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-white/50">
              <Film className="h-4 w-4" />
              <span className="text-xs">หนังที่ดูทั้งหมด</span>
            </div>
            <p className="mt-2 font-serif text-2xl text-[#F5F1E8]">
              {uniqueViews.length} <span className="text-sm text-white/40">เรื่อง</span>
            </p>
          </div>

          {topGenre && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 sm:col-span-2">
              <div className="flex items-center gap-2 text-white/50">
                <span className="text-xs">หมวดที่คุณชอบที่สุด</span>
              </div>
              <p className="mt-2 font-serif text-2xl text-[#E8A33D]">
                {topGenre[0]}{" "}
                <span className="text-sm text-white/40">
                  ดูไปแล้ว {topGenre[1]} เรื่อง
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Timeline */}
        {uniqueViews.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <Clock className="h-10 w-10 text-white/20" />
            <p className="mt-4 text-white/40">
              ยังไม่มีประวัติการดู ลองไปดูหนังสักเรื่องก่อนครับ
            </p>
            <Link
              href="/"
              className="mt-4 rounded-full bg-[#E8A33D] px-5 py-2 text-sm font-medium text-[#0F1115] hover:bg-[#f0b558]"
            >
              ไปเลือกหนัง
            </Link>
          </div>
        ) : (
          <div className="mt-12 space-y-10">
            {Array.from(groups.entries()).map(([dateLabel, groupViews]) => (
              <section key={dateLabel}>
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#E8A33D]" />
                  <h2 className="text-sm font-medium text-white/70">
                    {dateLabel}
                  </h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
                  {groupViews.map(({ movie, viewedAt }) => (
                    <Link
                      key={movie.id}
                      href={`/movies/${movie.id}`}
                      className="group"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-white/5 shadow-md shadow-black/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/60">
                        {movie.posterPath ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                            alt={movie.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-2 text-center text-xs text-white/40">
                            {movie.title}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                          <Clock className="h-3 w-3" />
                          {new Date(viewedAt).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <h3 className="mt-2 text-sm leading-snug transition-colors group-hover:text-[#E8A33D]">
                        {movie.title}
                      </h3>
                      {movie.voteAverage != null && (
                        <p className="text-xs text-white/50">
                          ★ {movie.voteAverage.toFixed(1)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}