import axios from "axios";
import dotenv from "dotenv";
import { getCache, setCache } from "../src/services/cacheService.js";

dotenv.config();

export default async function handler(req, res) {
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
