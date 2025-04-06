// /api/main.js
import { getMainPageData } from "../src/services/mainService.js";

const cache = new Map();
const CACHE_KEY = "main_page";
const CACHE_TTL = 1000 * 60 * 5; // 5 minutos

export default async function handler(req, res) {
  try {
    const cached = cache.get(CACHE_KEY);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_TTL) {
      console.log("🧠 Cache HIT /main");
      return res.status(200).json(cached.data);
    }

    console.log("⚙️  Cache MISS /main — scraping...");
    const data = await getMainPageData();

    if (data.error) {
      return res
        .status(500)
        .json({ error: "No se pudo obtener la página principal" });
    }

    // Guardar en cache
    cache.set(CACHE_KEY, {
      data,
      timestamp: now,
    });

    res.status(200).json(data);
  } catch (error) {
    console.error("Error en API /main:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
