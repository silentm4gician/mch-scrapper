// src/services/mainService.js
import { fetchMainPageData } from "../scrapers/mainPage.js";
import { getCache, setCache } from "./cacheService.js";

export async function getMainPageData() {
  const cacheKey = "mainPageData";
  const cached = await getCache(cacheKey);

  if (cached) {
    console.log("🧠 Cache HIT (main)");
    return cached;
  }

  console.log("🧠 Cache MISS (main)");
  const data = await fetchMainPageData();
  await setCache(cacheKey, data, process.env.CACHE_TTL || 3600);

  return data;
}
