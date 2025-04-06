// src/routes/main.js
import express from "express";
import { getMainPageData } from "../services/mainService.js";

const router = express.Router();

router.get("/main", async (req, res) => {
  try {
    const data = await getMainPageData();
    res.json(data);
  } catch (error) {
    console.error("Scraper error:", error);
    res.status(500).json({ error: "Error al scrapear monoschino2.com" });
  }
});

export default router;
