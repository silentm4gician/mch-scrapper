// src/scrapers/watchPage.js

import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeWatchPage(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      },
    });
    const $ = cheerio.load(data);

    const iframeSrc = $("#player iframe").attr("src");
    return iframeSrc || null;
  } catch (error) {
    console.error("Error scraping watch page:", error);
    return null;
  }
}
