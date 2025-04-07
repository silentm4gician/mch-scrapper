// /api/anime.js
import { getAnimePageData } from "../src/services/animeService.js";
import { applyCors } from "../src/utils/cors.js";

const cache = new Map();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutos

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Falta el parámetro 'url'" });
  }

  const cached = cache.get(url);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log("🧠 Cache HIT /anime");
    return res.status(200).json(cached.data);
  }

  try {
    console.log("⚙️  Cache MISS /anime — scraping...");
    const data = await getAnimePageData(url);

    if (data.error) {
      return res.status(500).json({ error: "No se pudo scrapear el anime" });
    }

    cache.set(url, {
      data,
      timestamp: now,
    });

    res.status(200).json(data);
  } catch (error) {
    console.error("Error en API /anime:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
