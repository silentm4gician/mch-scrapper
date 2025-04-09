// /api/search.js
import { getSearchResults } from "../src/services/searchService.js";
import { applyCors } from "../src/utils/cors.js";

const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 5 minutos

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Missing search query (?q=...)" });
  }

  const CACHE_KEY = `search_${query.toLowerCase().trim()}`;
  const now = Date.now();

  const cached = cache.get(CACHE_KEY);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`🧠 Cache HIT /search → "${query}"`);
    return res.status(200).json(cached.data);
  }

  try {
    console.log(`⚙️  Cache MISS /search → "${query}" — scraping...`);
    const data = await getSearchResults(query);

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No se encontraron resultados" });
    }

    // Guardar en cache
    cache.set(CACHE_KEY, {
      data,
      timestamp: now,
    });

    res.status(200).json(data);
  } catch (error) {
    console.error("Error en API /search:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
