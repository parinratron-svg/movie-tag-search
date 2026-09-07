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

function translateQuery(query: string): string[] {
  const matchedTerms: string[] = [];
  for (const [thaiPhrase, englishTerms] of Object.entries(thaiTagDictionary)) {
    if (query.includes(thaiPhrase)) {
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

  // extended search syntax: 'term = must include "term", " | " = OR ระหว่างเงื่อนไข
  const pattern = allTerms.map((t) => `'${t}`).join(" | ");

  return fuse.search(pattern).map((result) => result.item);
}