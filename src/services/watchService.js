import { scrapeWatchPage } from "../scrapers/watchPage.js";
import { getCache, setCache } from "./cacheService.js";

const DEFAULT_TTL = process.env.CACHE_TTL || 3600;

/**
 * Retorna el `iframe.src` de una página de monoschino2.com/ver/...
 * usando caching y scraping dinámico con Playwright.
 *
 * @param {string} url - URL completa de la página a scrapear
 * @returns {Promise<string|null>} - URL del iframe o null si no se encuentra
 */
export async function getWatchIframe(url) {
  const cacheKey = `iframe:${url}`;
  const cachedIframe = await getCache(cacheKey);

  if (cachedIframe) {
    console.log("🧠 Cache HIT");
    return cachedIframe;
  }

  console.log("🧠 Cache MISS");

  let iframe = await scrapeWatchPage(url);

  if (iframe) {
    await setCache(cacheKey, iframe, process.env.CACHE_TTL || 3600); // default 1h
  }

  return iframe;
}
