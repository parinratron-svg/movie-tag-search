import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.watchlist.findMany({
      where: { userId: user.id },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            overview: true,
            posterPath: true,
            releaseYear: true,
            voteAverage: true,
            genres: true,
            watchProviders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ watchlist: items });
  } catch (error) {
    console.error("GET Watchlist Error:", error);
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "กรุณาล็อกอินก่อนบันทึกรายการ" }, { status: 401 });
    }

    const { movieId } = await req.json();
    if (!movieId) {
      return NextResponse.json({ error: "Missing movieId" }, { status: 400 });
    }

    const item = await prisma.watchlist.upsert({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
      create: {
        userId: user.id,
        movieId,
      },
      update: {},
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("POST Watchlist Error:", error);
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get("movieId");

    if (!movieId) {
      return NextResponse.json({ error: "Missing movieId" }, { status: 400 });
    }

    await prisma.watchlist.deleteMany({
      where: {
        userId: user.id,
        movieId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Watchlist Error:", error);
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 });
  }
}
