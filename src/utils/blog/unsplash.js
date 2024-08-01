const axios = require("axios");
const fs = require("fs");
const fetch = require("node-fetch");

const UNSPLASH_ACCESS_KEY = "your_unsplash_access_key";

/**
 * Fetches an image URL and attribution details from Unsplash based on the provided title and size.
 * @param {string} title - The image title to search for.
 * @param {string} size - The desired size of the image (e.g., 'small', 'regular', 'full', 'raw').
 * @returns {Promise<Object>} - An object containing the image URL and attribution details.
 */
async function fetchImageUrl(title, size) {
  try {
    const response = await axios.get("https://api.unsplash.com/search/photos", {
      params: { query: title, per_page: 1 },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    const results = response.data.results;
    if (results.length > 0) {
      const image = results[0];
      return {
        url: image.urls[size] || image.urls.regular, // Default to regular if size not available
        attribution: `Photo by ${image.user.name} on Unsplash`,
        attributionLink: image.links.html,
      };
    } else {
      throw new Error("No images found for the given title");
    }
  } catch (error) {
    throw new Error(
      `Error fetching image for title "${title}": ${error.message}`
    );
  }
}

/**
 * Triggers a download event on Unsplash to comply with their API guidelines.
 * @param {string} downloadLink - The Unsplash download link for the image.
 */
async function triggerDownload(downloadLink) {
  try {
    await axios.get(downloadLink, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });
  } catch (error) {
    console.error(`Error triggering download: ${error.message}`);
  }
}

/**
 * Main function to fetch and download an image based on a title and size.
 * @param {string} title - The image title to search for.
 * @param {string} size - The desired size of the image.
 * @param {string} savePath - The directory path to save the image.
 * @returns {Promise<Object>} - An object containing the path/filename of the saved image and attribution details.
 */
async function downloadImageByTitle(title, size, savePath) {
  const { url, attribution, attributionLink } = await fetchImageUrl(
    title,
    size
  );

  // Trigger the download event to comply with Unsplash's guidelines
  await triggerDownload(attributionLink);

  // Return the URL for hotlinking instead of downloading
  return {
    imageUrl: url,
    attribution,
    attributionLink,
  };
}

module.exports = { downloadImageByTitle };
