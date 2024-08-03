import axios from "axios";
import sharp from "sharp";
import dotenv from "dotenv";
dotenv.config();

/**
 * Uploads an image to Bunny CDN.
 * @param {Buffer} image - The Buffer of the image file.
 * @param {string} filename - The name of the file without extension.
 * @returns {Promise<string | void>}
 */
export async function uploadImageToBunnyCDN(
  image: Buffer,
  filename: string
): Promise<string | void> {
  const apiKey = process.env.BUNNY_API_KEY;
  const storageZone = process.env.BUNNY_STORAGE_ZONE_NAME;

  try {
    // Convert the image to WebP format
    const webpBuffer = await sharp(image).webp({ quality: 80 }).toBuffer();

    // Upload the WebP image to Bunny CDN
    await axios.put(
      `https://storage.bunnycdn.com/${storageZone}/images/${filename}.webp`,
      webpBuffer,
      {
        headers: {
          AccessKey: apiKey,
          "Content-Type": "image/webp",
        },
      }
    );

    return `https://images.buzznfinds.com/images/${filename}.webp`;
  } catch (error: any) {
    console.error("Error uploading image:", error.message);
    throw error; // Rethrow the error to allow calling function to handle it
  }
}
