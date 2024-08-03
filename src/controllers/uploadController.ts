import { Request, Response } from "express";
import { uploadImageToBunnyCDN } from "../utils/bunny/imageupload";

export const uploadSingleImage = async (req: Request, res: Response) => {
  const file = req.file;
  const { filename } = req.body;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const Filename = `${filename}-${Date.now().toString().slice(6, 13)}`;
    const imageUrl = await uploadImageToBunnyCDN(file.buffer, Filename);

    if (imageUrl) {
      return res
        .status(200)
        .json({ message: "Image uploaded successfully", image: imageUrl });
    } else {
      return res.status(500).json({ message: "Image upload failed" });
    }
  } catch (error: any) {
    console.error("Error uploading image:", error.message);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
