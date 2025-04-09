// src/scrapers/fetchSearchResults.js
import axios from "axios";
import * as cheerio from "cheerio";
import { BASE_URL } from "../config.js";

export async function fetchSearchResults(query) {
  const url = `${BASE_URL}/directorio/anime?q=${encodeURIComponent(query)}`;
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);

  const results = [];

  $(".animes-container ul.grid-animes li").each((_, el) => {
    const anchor = $(el).find("a");
    const href = anchor.attr("href"); // ej: /blue-lock-episode-nagi
    const url = new URL(href, BASE_URL).href;

    const id = href.replace(/^\//, ""); // elimina el / del inicio

    const type = $(el).find("span.tipo").text().trim();
    const year = $(el).find("span.estreno").text().trim();
    const status = $(el).find("p.gray").text().trim();

    const image = $(el).find("img").attr("src");
    const title = $(el).find("p").last().text().trim(); // solo el último <p>

    results.push({
      id, // ← nuevo campo
      title,
      url,
      image,
      type,
      year,
      status,
    });
  });

  return results;
}
