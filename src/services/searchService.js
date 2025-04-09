import { fetchSearchResults } from "../scrapers/searchPage.js";
import { getCache, setCache } from "./cacheService.js";

export async function getSearchResults(query) {
  const cacheKey = `search:${query.toLowerCase().trim()}`;
  const cached = await getCache(cacheKey);

  if (cached) {
    console.log(`🧠 Cache HIT (search: ${query})`);
    return cached;
  }

  console.log(`🧠 Cache MISS (search: ${query})`);
  const data = await fetchSearchResults(query);

  await setCache(cacheKey, data, process.env.CACHE_TTL || 3600);

  return data;
}
