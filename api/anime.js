// /api/anime.js
import { getAnimePageData } from "../src/services/animeService";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Falta el parámetro 'url'" });
  }

  try {
    const data = await getAnimePageData(url);

    if (data.error) {
      return res.status(500).json({ error: "No se pudo scrapear el anime" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error en API /anime:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
