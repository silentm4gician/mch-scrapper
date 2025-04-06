import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const response = await axios.get(process.env.PLAYWRIGHT_SERVICE_URL, {
      params: { url },
    });

    const { iframe } = response.data;
    res.json({ iframe });
  } catch (error) {
    console.error("Error al contactar con el microservicio:", error.message);
    res
      .status(500)
      .json({ error: "Error al obtener iframe desde el microservicio" });
  }
}
