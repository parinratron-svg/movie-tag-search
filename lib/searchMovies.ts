import Fuse from "fuse.js";
import { thaiTagDictionary } from "./thaiTagDictionary";

type SearchableMovie = {
  id: string;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseYear: number | null;
  voteAverage: number | null;
  genres: string[];
  tags: string[];
};

// คำนวณระยะห่างระหว่าง 2 คำ (ต้องแก้กี่ตัวอักษรถึงจะเหมือนกัน)
function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[a.length][b.length];
}

// เช็คว่า "phrase" ปรากฏอยู่ใน "query" แบบยอมให้พิมพ์ผิดได้เล็กน้อยไหม
function fuzzyContains(query: string, phrase: string): boolean {
  if (phrase.length <= 2) {
    // คำสั้นเกินไป การ fuzzy จะพลาดง่าย ใช้ตรงตัวเป๊ะแทน
    return query.includes(phrase);
  }

  const maxDistance = phrase.length <= 4 ? 1 : 2;

  for (let start = 0; start < query.length; start++) {
    for (
      let len = phrase.length - maxDistance;
      len <= phrase.length + maxDistance;
      len++
    ) {
      if (len < 1 || start + len > query.length) continue;
      const window = query.slice(start, start + len);
      if (levenshtein(window, phrase) <= maxDistance) {
        return true;
      }
    }
  }
  return false;
}

function translateQuery(query: string): string[] {
  const matchedTerms: string[] = [];
  for (const [thaiPhrase, englishTerms] of Object.entries(thaiTagDictionary)) {
    if (fuzzyContains(query, thaiPhrase)) {
      matchedTerms.push(...englishTerms);
    }
  }
  return matchedTerms;
}

export function searchMovies<T extends SearchableMovie>(
  query: string,
  movies: T[]
): T[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const translatedTerms = translateQuery(trimmed);
  const allTerms = Array.from(new Set([trimmed, ...translatedTerms]));

  const fuse = new Fuse(movies, {
    keys: [
      { name: "tags", weight: 0.4 },
      { name: "genres", weight: 0.3 },
      { name: "title", weight: 0.2 },
      { name: "overview", weight: 0.1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    useExtendedSearch: true,
  });

  const pattern = allTerms.map((t) => `'${t}`).join(" | ");

  return fuse.search(pattern).map((result) => result.item);
}