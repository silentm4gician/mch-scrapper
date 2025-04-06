// /api/main.js
import { getMainPageData } from "../src/services/mainService.js";

export default async function handler(req, res) {
  try {
    const data = await getMainPageData();

    if (data.error) {
      return res
        .status(500)
        .json({ error: "No se pudo obtener la página principal" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error en API /main:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
