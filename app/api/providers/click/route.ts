import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { providerName, movieId } = await req.json();

    if (!providerName || !movieId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const clickRecord = await prisma.providerClick.create({
      data: {
        providerName,
        movieId,
        userId: user?.id ?? null,
      },
    });

    return NextResponse.json({ success: true, clickRecord });
  } catch (error) {
    console.error("Provider click log error:", error);
    return NextResponse.json({ error: "Failed to record click" }, { status: 500 });
  }
}
