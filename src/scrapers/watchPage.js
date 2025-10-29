// src/scrapers/watchPage.js

import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Extracts video sources from the page's JavaScript code
 * @param {string} html - The HTML content of the page
 * @returns {Array} Array of video sources with their details
 */
function extractVideoSources(html) {
  const sources = [];
  const scriptRegex = /tabsArray\["?(\d+)"?\]\s*=\s*["']([^"']+)["']/g;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    const [_, id, iframeHtml] = match;
    const $iframe = cheerio.load(iframeHtml);
    const src = $iframe("iframe").attr("src");

    if (src) {
      sources.push({
        id: parseInt(id),
        src: src,
        isDefault: id === "1", // First source is usually the default
      });
    }
  }

  return sources;
}

/**
 * Extracts the server names from the page
 * @param {Object} $ - Cheerio instance
 * @returns {Array} Array of server objects with id and name
 */
function extractServers($) {
  const servers = [];
  $(".episode-page__servers-list li").each((index, element) => {
    const $li = $(element);
    const $a = $li.find("a");
    const id = $a.attr("href")?.replace("#vid", "");
    const name = $a.attr("title") || $a.text().trim();

    if (id && name) {
      servers.push({
        id: parseInt(id),
        name: name,
        isActive: $li.hasClass("is-active"),
      });
    }
  });

  return servers;
}

export async function scrapeWatchPage(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Referer: "https://animepelix.com/",
      },
    });

    const $ = cheerio.load(data);

    // Extract episode title
    const title = $(".title.is-size-4").first().text().trim();

    // Extract main video iframe
    const mainIframe = $(".iframe-container iframe");
    const defaultIframeSrc = mainIframe.attr("src");

    // Extract available servers and their corresponding iframe sources
    const servers = [];
    const videoSources = [];

    // First try to get servers from the tabs
    $(".episode-page__servers-list li").each((index, element) => {
      const $li = $(element);
      const $a = $li.find("a");
      const id = $a.attr("href")?.replace("#vid", "");
      const name = $a.attr("title") || $a.text().trim();

      if (id && name) {
        servers.push({
          id: parseInt(id),
          name: name,
          isActive: $li.hasClass("is-active"),
        });
      }
    });

    // Extract all video sources from the tabsArray in the script
    const scripts = $("script").toArray();

    for (const script of scripts) {
      const scriptContent = $(script).html() || "";

      // Look for the tabsArray definition
      const tabsArrayMatch = scriptContent.match(
        /var\s+tabsArray\s*=\s*new\s*Object\(\)\s*;([\s\S]*?)(?=<\/script>|$)/
      );

      if (tabsArrayMatch && tabsArrayMatch[1]) {
        const tabsArrayContent = tabsArrayMatch[1];

        // Extract all tab entries using a pattern that matches the format: tabsArray["1"] = "<iframe...";
        const tabEntries = [];
        const tabRegex =
          /tabsArray\s*\[\s*["']?(\d+)["']?\s*\]\s*=\s*"([^"]+)"/g;

        let match;
        while ((match = tabRegex.exec(scriptContent)) !== null) {
          tabEntries.push(match);
        }

        // Process each tab entry
        for (const match of tabEntries) {
          try {
            const id = match[1];
            const iframeHtml = match[2];

            // Extract src from iframe HTML
            const srcMatch = iframeHtml.match(/src\s*=\s*['"]([^'"]+)['"]/i);

            if (srcMatch && srcMatch[1]) {
              const src = srcMatch[1].trim();
              // Only add if not already in the list (avoid duplicates)
              if (src && !videoSources.some((s) => s.src === src)) {
                videoSources.push({
                  id: parseInt(id),
                  src: src,
                  isDefault: id === "1",
                });
              }
            }
          } catch (e) {
            console.warn(`Error processing tab entry:`, e);
          }
        }

        // If we found entries, no need to check other scripts
        if (videoSources.length > 0) break;
      }
    }

    // If no video sources found in script, try to get the default iframe
    if (videoSources.length === 0 && defaultIframeSrc) {
      videoSources.push({
        id: 1,
        src: defaultIframeSrc,
        isDefault: true,
      });
    }

    // Extract navigation links
    const prevEpisode = $('a[title*="Anterior"], a:contains("Anterior")')
      .first()
      .attr("href");
    const nextEpisode = $('a[title*="Siguiente"], a:contains("Siguiente")')
      .first()
      .attr("href");
    const episodeList = $(
      'a[title*="Lista de Episodios"], a:contains("Episodios")'
    )
      .first()
      .attr("href");

    // Extract series information - try multiple selectors
    const seriesTitle =
      $("h1.title a, .anime-title a").first().text().trim() ||
      $("h1.title")
        .first()
        .text()
        .replace(/\s*Episodio.*$/, "")
        .trim();

    const seriesUrl = $("h1.title a, .anime-title a").first().attr("href");

    // Extract episode number from multiple possible locations
    let episodeNumber = null;
    const titleText = $("h1.title").first().text().trim();
    const episodeMatch =
      titleText.match(/(?:Episodio|Capítulo|Episode|Chapter)[\s:]*?(\d+)/i) ||
      url.match(/(?:episodio-|ep-|e|cap-|capitulo-|chapter-|c-)(\d+)/i);

    if (episodeMatch && episodeMatch[1]) {
      episodeNumber = parseInt(episodeMatch[1]);
    } else {
      // Try to find episode number in the URL as a fallback
      const urlMatch = url.match(/(\d+)(?:\/|\?|$)/);
      if (urlMatch) {
        episodeNumber = parseInt(urlMatch[1]);
      }
    }

    return {
      title,
      seriesTitle,
      seriesUrl,
      episodeNumber,
      iframe: videoSources.length > 0 ? videoSources[0].src : defaultIframeSrc,
      videoSources,
      servers,
      navigation: {
        prev: prevEpisode ? new URL(prevEpisode, url).toString() : null,
        next: nextEpisode ? new URL(nextEpisode, url).toString() : null,
        episodeList: episodeList ? new URL(episodeList, url).toString() : null,
      },
      timestamp: new Date().toISOString(),
      sourceUrl: url,
    };
  } catch (error) {
    console.error("Error scraping watch page:", error);
    return {
      error: error.message,
      url: url,
      timestamp: new Date().toISOString(),
    };
  }
}
