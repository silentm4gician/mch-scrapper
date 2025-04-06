// src/scrapers/animePagePlaywright.js
import { chromium } from "playwright";

export async function scrapeAnimePageWithPlaywright(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Espera a que aparezca un selector confiable
    await page.waitForSelector(".sinopsis", { timeout: 15000 });

    const data = await page.evaluate(() => {
      const title =
        document.querySelector("h1.title")?.textContent.trim() || "";
      const description =
        document.querySelector(".sinopsis p")?.textContent.trim() || "";

      const genres = Array.from(document.querySelectorAll(".generos a")).map(
        (a) => a.textContent.trim()
      );

      const image =
        document
          .querySelector(".anime__details__pic")
          ?.getAttribute("data-setbg") || "";

      const extraInfo = {};
      document.querySelectorAll(".anime__details__widget li").forEach((li) => {
        const key = li
          .querySelector("span")
          ?.textContent.replace(":", "")
          .trim()
          .toLowerCase();
        const value = li.textContent
          .replace(li.querySelector("span")?.textContent || "", "")
          .trim();
        if (key) extraInfo[key] = value;
      });

      const episodes = Array.from(
        document.querySelectorAll(".episodios li a")
      ).map((a) => ({
        title: a.textContent.trim(),
        url: a.href,
      }));

      return { title, description, genres, image, extraInfo, episodes };
    });

    return data;
  } catch (error) {
    console.error("Playwright scraper error:", error);
    return { error: "No se pudo scrapear con Playwright" };
  } finally {
    await browser.close();
  }
}
