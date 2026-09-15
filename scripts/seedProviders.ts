import "dotenv/config";
import { prisma } from "../lib/prisma";

export async function seedProviders() {
  const movies = await prisma.movie.findMany();
  console.log(`Found ${movies.length} movies in DB to update providers...`);

  const providerList = [
    { name: "Netflix", url: "https://www.netflix.com/th/" },
    { name: "Disney+ Hotstar", url: "https://www.hotstar.com/th" },
    { name: "Prime Video", url: "https://www.primevideo.com/" },
    { name: "HBO GO", url: "https://www.hbogo.co.th/" },
    { name: "Viu", url: "https://www.viu.com/ott/th/" },
    { name: "TrueID", url: "https://movie.trueid.net/" },
  ];

  for (let i = 0; i < movies.length; i++) {
    const m = movies[i];
    // Assign 1-3 popular legal providers deterministically based on movie index & title
    const p1 = providerList[i % providerList.length];
    const p2 = providerList[(i + 2) % providerList.length];
    const p3 = (i % 2 === 0) ? providerList[(i + 4) % providerList.length] : null;

    const providers = [
      `${p1.name}|${p1.url}`,
      `${p2.name}|${p2.url}`,
    ];
    if (p3) {
      providers.push(`${p3.name}|${p3.url}`);
    }

    await prisma.movie.update({
      where: { id: m.id },
      data: { watchProviders: providers },
    });
    console.log(`Updated ${m.title} -> ${providers.join(", ")}`);
  }

  console.log("Finished seeding providers!");
}

seedProviders()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
