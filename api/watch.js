import axios from "axios";
import dotenv from "dotenv";
import { getCache, setCache } from "../src/services/cacheService.js";

dotenv.config();

export default async function handler(req, res) {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  let url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  // 🚀 Cache
  const cached = await getCache(url);
  if (cached) {
    console.log("✅ Cache HIT");
    return res.json(cached);
  }

  console.log("🧠 Cache MISS");

  try {
    const response = await axios.get(process.env.PLAYWRIGHT_SERVICE_URL, {
      params: { url },
    });

    const { videoUrl, iframe, urlFetch, serverName, allIframes } =
      response.data.video;

    const cacheData = { videoUrl, iframe, urlFetch, serverName, allIframes };
    await setCache(url, cacheData, 3600);

    res.json(cacheData);
  } catch (error) {
    console.error("❌ Error al contactar con el microservicio:", error.message);
    res
      .status(500)
      .json({ error: "Error al obtener datos desde el microservicio" });
  }
}
