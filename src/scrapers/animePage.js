import axios from "axios";
import * as cheerio from "cheerio";
import { BASE_URL } from "../config.js";

export async function fetchAnimePageData(url) {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const id = url.split("/").filter(Boolean).pop(); // <-- Extrae el id desde la URL

    const title = $("section.d-sm-none h2").text().trim();
    const description = $("section.d-sm-none p").text().trim();
    const image = $(".lazy.bg-secondary").attr("src") || null;

    const extraInfo = {};

    // Año y formato
    $("span.badge.text-bg-dark").each((_, el) => {
      const text = $(el).text().trim();
      if (text.match(/^\d{4}$/)) {
        extraInfo.year = text;
      } else {
        extraInfo.format = text;
      }
    });

    // Descripción extendida
    $(".tab-pane dl dt").each((_, el) => {
      const label = $(el).text().trim();
      const value = $(el).next("dd").text().trim();
      if (label === "Tipo:") extraInfo.format = value;
      if (label === "Fecha de emisión:") extraInfo.year = value;
    });

    // Estado
    const estado = $(".bi-exclamation-circle")
      .parent()
      .find("div")
      .last()
      .text()
      .trim();
    if (estado) extraInfo.status = estado;

    // Número total de episodios
    const episodiosTexto = $(".bi-collection-play").parent().text();
    const matchEps = episodiosTexto.match(/Eps: (\d+)/i);
    if (matchEps) extraInfo.totalEpisodes = parseInt(matchEps[1]);

    // Géneros
    const genres = [];
    $("a[href*='/genero/'], .tab-pane .badge.bg-secondary").each((_, el) => {
      genres.push($(el).text().trim());
    });

    // Episodios individuales
    const episodes = [];
    $(".eplist-container .episode-block li a").each((_, el) => {
      const episodeUrl = $(el).attr("href");
      const episodeTitle =
        $(el).find("h2").text().trim() || $(el).text().trim();
      const match = episodeTitle.match(/Episodio\s+(\d+)/i);
      const episodeNumber = match ? parseInt(match[1]) : null;

      if (episodeUrl && episodeNumber !== null) {
        const fullUrl = `${BASE_URL}${episodeUrl}`;
        const id = episodeUrl.split("/").filter(Boolean).pop(); // <-- ID del episodio

        episodes.push({
          id,
          number: episodeNumber,
          title: episodeTitle,
          url: fullUrl,
        });
      }
    });

    // Si no hay episodios y es una película, crear uno por defecto
    if (episodes.length === 0 && extraInfo.format === "Película") {
      const id = url.split("/").filter(Boolean).pop();
      episodes.push({
        id,
        number: 1,
        title: "Película completa",
        url: `${BASE_URL}/ver/${id}-1`,
      });
    }

    episodes.sort((a, b) => a.number - b.number);

    return {
      id,
      title,
      description,
      genres,
      image,
      extraInfo,
      episodes,
    };
  } catch (err) {
    console.error("Error con Cheerio:", err);
  }
}
