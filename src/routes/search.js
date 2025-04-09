// src/routes/search.js
import express from "express";
import { getSearchResults } from "../services/searchService.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query)
    return res.status(400).json({ error: "Missing query parameter 'q'" });

  try {
    const results = await getSearchResults(query);
    res.json(results);
  } catch (error) {
    console.error("❌ Error en búsqueda:", error.message);
    res.status(500).json({ error: "Error al obtener resultados de búsqueda" });
  }
});

export default router;
