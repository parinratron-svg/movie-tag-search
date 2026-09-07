import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const movies = await prisma.movie.findMany({
    select: { tags: true, genres: true },
  });

  const tagCount = new Map<string, number>();
  const genreCount = new Map<string, number>();

  for (const movie of movies) {
    for (const tag of movie.tags) {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
    }
    for (const genre of movie.genres) {
      genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1);
    }
  }

  const sortedTags = Array.from(tagCount.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  const sortedGenres = Array.from(genreCount.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  console.log(`\n=== หมวดหมู่ (${sortedGenres.length} หมวดหมู่) ===`);
  sortedGenres.forEach(([genre, count]) => {
    console.log(`${genre} (${count} เรื่อง)`);
  });

  console.log(`\n=== Tags ที่พบบ่อยที่สุด 60 อันดับแรก (จากทั้งหมด ${sortedTags.length}) ===`);
  sortedTags.slice(0, 60).forEach(([tag, count]) => {
    console.log(`${tag} (${count} เรื่อง)`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());