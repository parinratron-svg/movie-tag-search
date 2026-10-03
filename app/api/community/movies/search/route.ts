import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    let movies;
    if (query) {
      movies = await prisma.movie.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { genres: { hasSome: [query] } },
          ],
        },
        select: {
          id: true,
          title: true,
          posterPath: true,
          releaseYear: true,
          genres: true,
          voteAverage: true,
        },
        take: 12,
      });
    } else {
      // คืนค่าหนังยอดนิยมเริ่มต้น
      movies = await prisma.movie.findMany({
        select: {
          id: true,
          title: true,
          posterPath: true,
          releaseYear: true,
          genres: true,
          voteAverage: true,
        },
        orderBy: { voteAverage: "desc" },
        take: 12,
      });
    }

    return NextResponse.json({ movies });
  } catch (error: any) {
    console.error("GET /api/community/movies/search Error:", error);
    return NextResponse.json({ error: "ไม่สามารถค้นหาหนังได้" }, { status: 500 });
  }
}
