//src/services/animeService.js

import { getCache, setCache } from "./cacheService.js";
import { fetchAnimePageData } from "../scrapers/animePage.js";

export async function getAnimePageData(url) {
  const cacheKey = `animePage:${url}`;
  const cached = await getCache(cacheKey);

  if (cached) {
    console.log("🧠 Cache HIT (anime info)");
    return cached;
  }

  console.log("🧠 Cache MISS (anime info)");
  const data = await fetchAnimePageData(url);
  if (!data.error) {
    await setCache(cacheKey, data, process.env.CACHE_TTL || 3600);
  }

  return data;
}
