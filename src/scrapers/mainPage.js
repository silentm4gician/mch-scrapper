import axios from "axios";
import * as cheerio from "cheerio";
import { BASE_URL } from "../config.js";

export async function fetchMainPageData() {
  const { data: html } = await axios.get(BASE_URL);
  const $ = cheerio.load(html);

  // 🎠 Carousel
  const carousel = [];
  $(".carousel-item").each((i, el) => {
    const title = $(el).find("h2").text().trim();
    const description = $(el).find(".sipno").text().trim();
    const relativeUrl = $(el).find("a").attr("href");
    const url = new URL(relativeUrl, BASE_URL).href;

    const imgTag = $(el).find("img");
    const imageRelative = imgTag.attr("data-src") || imgTag.attr("src");
    const image = new URL(imageRelative, BASE_URL).href;

    carousel.push({
      title,
      description,
      image,
      url,
    });
  });

  // 🆕 Últimos episodios
  const recentEpisodes = [];
  $("ul.row li").each((_, el) => {
    const element = $(el);
    const a = element.find("a");
    const href = a.attr("href");
    const title = element.find("h2").text().trim();
    const episodeNumber = element.find("span.episode").text().trim();

    const img = element.find("img");
    const image = img.attr("data-src") || img.attr("src"); // fallback
    recentEpisodes.push({
      title,
      episodeNumber,
      image,
      url: `${BASE_URL}${href}`,
    });
  });

  // 📺 Series recientes
  const recentSeries = [];

  $("section h2:contains('Series recientes')")
    .next("ul")
    .find("li")
    .each((i, el) => {
      const element = $(el);
      const anchor = element.find("a");
      const href = anchor.attr("href");
      const title = element.find("h3").text().trim();
      const image = element.find("img").attr("data-src");
      const status = element.find("span.badge").text().trim();

      recentSeries.push({
        title,
        url: `${BASE_URL}${href}`,
        image,
        status,
      });
    });

  const lastetsEp = recentEpisodes.slice(0, 10);
  return { carousel, lastetsEp, recentSeries };
}
