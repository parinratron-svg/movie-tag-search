import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const views = await prisma.viewHistory.findMany({
    where: { userId: user.id },
    include: { movie: true },
    orderBy: { viewedAt: "desc" },
    take: 50,
  });

  // เอาเฉพาะเรื่องล่าสุด ตัดรายการซ้ำออก (ดูเรื่องเดิมหลายรอบ)
  const seen = new Set<string>();
  const uniqueViews = views.filter((v) => {
    if (seen.has(v.movieId)) return false;
    seen.add(v.movieId);
    return true;
  });

  return (
    <main className="min-h-screen bg-[#0F1115] px-6 py-12 text-[#F5F1E8] sm:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-2xl">ประวัติการดู</h1>

        {uniqueViews.length === 0 && (
          <p className="mt-8 text-white/40">
            ยังไม่มีประวัติการดู ลองไปดูหนังสักเรื่องก่อนครับ
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
          {uniqueViews.map(({ movie, viewedAt }) => (
            <Link key={movie.id} href={`/movies/${movie.id}`} className="group">
              <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-white/5 shadow-md shadow-black/40 transition-all duration-300 group-hover:-translate-y-1">
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
              </div>
              <h3 className="mt-2 text-sm leading-snug group-hover:text-[#E8A33D]">
                {movie.title}
              </h3>
              <p className="text-xs text-white/50">
                ดูเมื่อ {new Date(viewedAt).toLocaleDateString("th-TH")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}