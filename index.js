import express from "express";
import dotenv from "dotenv";
import mainRoute from "./src/routes/main.js";
import watchRoute from "./src/routes/watch.js";
import animeRoute from "./src/routes/anime.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/api", mainRoute);

app.use("/api", watchRoute);

app.use("/api", animeRoute);

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
});
