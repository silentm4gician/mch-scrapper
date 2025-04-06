// src/routes/anime.js
import express from "express";
import { getAnimePageData } from "../services/animeService.js";

const router = express.Router();

router.get("/anime", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Falta el parámetro 'url'" });
  }

  try {
    const data = await getAnimePageData(url);
    if (data.error) throw new Error(data.error);

    res.json(data);
  } catch (error) {
    console.error("Error en /anime:", error);
    res.status(500).json({ error: "No se pudo obtener la página del anime" });
  }
});

export default router;
