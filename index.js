import express from "express";
import cors from "cors";

// Import route handlers
import mainHandler from "./api/main.js";
import animeHandler from "./api/anime.js";
import searchHandler from "./api/search.js";
import watchHandler from "./api/watch.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
const ENDPOINTS_DISPONIBLES = {
  home: "/api/main",
  watch: "/api/watch?url={query}",
  animeInfo: "/api/anime?url={query}",
  search: "/api/search?q={query}",
};

// Root endpoint to show available endpoints
app.get("/", (req, res) => {
  res.json({
    message: "Scraper no oficial de monoschinos2",
    endpoints: ENDPOINTS_DISPONIBLES,
  });
});

// API Routes
app.get("/api/main", (req, res) => mainHandler(req, res));
app.get("/api/anime", (req, res) => animeHandler(req, res));
app.get("/api/search", (req, res) => searchHandler(req, res));
app.get("/api/watch", (req, res) => watchHandler(req, res));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  Object.entries(ENDPOINTS_DISPONIBLES).forEach(([key, value]) => {
    console.log(`- ${key}: http://localhost:${PORT}${value}`);
  });
});
