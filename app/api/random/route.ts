import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const count = await prisma.movie.count();
  if (count === 0) {
    return NextResponse.json({ error: "ไม่มีข้อมูลหนัง" }, { status: 404 });
  }

  const randomIndex = Math.floor(Math.random() * count);
  const [movie] = await prisma.movie.findMany({
    take: 1,
    skip: randomIndex,
    select: { id: true },
  });

  return NextResponse.json({ id: movie.id });
}