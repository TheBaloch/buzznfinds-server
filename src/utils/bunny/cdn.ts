import axios from "axios";

const apiKey = process.env.CDN_API_KEY;
const pullZoneId = process.env.CDN_PULLZONE_ID;
const serverUrl = process.env.SERVER_URL || "";

export default async function purge(api: string) {
  const purgeEndpoint = `https://bunnycdn.com/api/pullzone/${pullZoneId}/purgeCache`;

  const url = serverUrl + api;
  const payload = { url };

  try {
    await axios.post(purgeEndpoint, payload, {
      headers: {
        AccessKey: apiKey,
        "Content-Type": "application/json",
      },
    });
    console.log(`Cache purged successfully for URL: ${url}`);
  } catch (error: any) {
    console.error(`Failed to purge cache for URL: ${url}`, error.response.data);
  }
}
