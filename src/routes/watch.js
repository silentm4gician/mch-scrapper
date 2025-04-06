import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get("/watch", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const { data } = await axios.get(process.env.PLAYWRIGHT_SERVICE_URL, {
      params: { url },
    });

    res.json(data); // { iframe: ... }
  } catch (error) {
    console.error("Error al contactar con el microservicio:", error.message);
    res
      .status(500)
      .json({ error: "Error al obtener el iframe desde el microservicio" });
  }
});

export default router;
