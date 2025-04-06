// /api/watch.js
import { getWatchIframe } from "../src/services/watchService.js";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  try {
    const iframe = await getWatchIframe(url);
    if (!iframe) {
      return res.status(404).json({ error: "Iframe no encontrado" });
    }

    res.status(200).json({ iframe });
  } catch (error) {
    console.error("Scraper error:", error);
    res.status(500).json({ error: "Error al scrapear monoschino2.com" });
  }
}
