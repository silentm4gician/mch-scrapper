import axios from "axios";

export async function getDirectVideoUrl(iframeUrl) {
  try {
    let url = new URL(iframeUrl);

    // Handle redirect URLs like: https://re.animepelix.net/redirect.php?id=...
    if (url.pathname.includes("redirect.php") && url.searchParams.has("id")) {
      const redirectId = url.searchParams.get("id");
      if (redirectId) {
        // If the id is a full URL, use it directly
        if (redirectId.startsWith("http")) {
          iframeUrl = redirectId;
        } else {
          // Otherwise construct the face.php URL
          iframeUrl = `https://re.ironhentai.com/face.php?id=${redirectId}`;
        }
        // Create new URL object with updated iframeUrl
        url = new URL(iframeUrl);
      }
    }

    let videoId = url.searchParams.get("id");

    // Rest of the function remains the same...
    if (!videoId) {
      const pathMatch = iframeUrl.match(/embed\/([^?]+)/);
      if (pathMatch && pathMatch[1]) {
        videoId = pathMatch[1];
      }
    }

    if (!videoId) {
      throw new Error("Could not extract video ID from URL");
    }

    const huggingFaceUrl = `https://re.ironhentai.com/hugging.php?id=${videoId}`;

    const response = await axios.head(huggingFaceUrl, {
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        Referer: "https://monoschino2.com/",
      },
    });

    if (
      response.status >= 300 &&
      response.status < 400 &&
      response.headers.location
    ) {
      return response.headers.location;
    }

    throw new Error("No redirect URL found in response");
  } catch (error) {
    console.error("Error getting direct video URL:", error);
    throw error;
  }
}
