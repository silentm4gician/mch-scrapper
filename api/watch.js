import axios from "axios";
import cheerio from "cheerio";
import dotenv from "dotenv";
import { getCache, setCache } from "../src/services/cacheService.js";

dotenv.config();

// 🔍 Extrae el iframe embed de la página de monoschino2
async function extractIframeUrlFromMonoschino(url) {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    const iframeSrc = $("div#player iframe").attr("src");

    return iframeSrc?.startsWith("http") ? iframeSrc : null;
  } catch (err) {
    console.error("❌ Error extrayendo iframe:", err.message);
    return null;
  }
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  let url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  // 🔁 Si es de monoschino, extraer el iframe embed
  if (url.includes("monoschino2.com/ver/")) {
    const extracted = await extractIframeUrlFromMonoschino(url);
    if (!extracted)
      return res.status(400).json({ error: "No se pudo extraer el iframe" });
    url = extracted;
  }

  // 🧹 Si es un redirect.php?id=..., extraer el id y usarlo directamente
  if (url.includes("redirect.php?id=")) {
    const redirectMatch = url.match(/id=(https?:\/\/.+)$/);
    if (redirectMatch) {
      url = decodeURIComponent(redirectMatch[1]);
      console.log("🔗 Limpiando redirect, nueva URL:", url);
    }
  }

  console.log("🔍 URL final después de limpieza:", url);

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

    const { videoUrl, iframe } = response.data;

    const cacheData = { videoUrl, iframe };
    await setCache(url, cacheData, 3600);

    res.json(cacheData);
  } catch (error) {
    console.error("❌ Error al contactar con el microservicio:", error.message);
    res
      .status(500)
      .json({ error: "Error al obtener datos desde el microservicio" });
  }
}
