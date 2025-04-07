import axios from "axios";
import dotenv from "dotenv";
import { getCache, setCache } from "../src/services/cacheService.js";
// import { applyCors } from "../src/utils/cors.js";

dotenv.config();

export default async function handler(req, res) {
  // CORS headers
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin"); // Mejora compatibilidad caché proxy
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // 👇 Devuelve todos los headers CORS necesarios en la respuesta OPTIONS
    return res.status(204).end();
  }

  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  // Intentar cache
  const cached = await getCache(url);
  if (cached) {
    console.log("✅ Cache HIT");
    return res.json({ iframe: cached });
  }

  console.log("🧠 Cache MISS");
  try {
    const response = await axios.get(process.env.PLAYWRIGHT_SERVICE_URL, {
      params: { url },
    });

    const { iframe } = response.data;

    // Guardar en cache
    await setCache(url, iframe, 3600); // TTL = 1h

    res.json({ iframe });
  } catch (error) {
    console.error("Error al contactar con el microservicio:", error.message);
    res
      .status(500)
      .json({ error: "Error al obtener iframe desde el microservicio" });
  }
}
