import axios from "axios";
import dotenv from "dotenv";
import { getCache, setCache } from "../src/services/cacheService.js";
// import { applyCors } from "../src/utils/cors.js";

dotenv.config();

export default async function handler(req, res) {
  // CORS...
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  // Intentar cache
  const cached = await getCache(url);
  if (cached) {
    console.log("✅ Cache HIT");
    return res.json(cached); // <-- Ya tiene videoUrl e iframe
  }

  console.log("🧠 Cache MISS");

  try {
    const response = await axios.get(process.env.PLAYWRIGHT_SERVICE_URL, {
      params: { url },
    });

    const { videoUrl, iframe } = response.data;

    // Guardar en cache
    const cacheData = { videoUrl, iframe };
    await setCache(url, cacheData, 3600);

    res.json(cacheData);
  } catch (error) {
    console.error("Error al contactar con el microservicio:", error.message);
    res
      .status(500)
      .json({ error: "Error al obtener datos desde el microservicio" });
  }
}
