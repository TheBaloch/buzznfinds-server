import path from "path";
import fs from "fs";

export const addToSitemap = (link: string) => {
  const filePath = path.join(__dirname, "../sitemap.txt");
  // Check if file exists
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");

    // Handle the case where the file is empty
    if (data) {
      const sitemap = data.split("\n").filter(Boolean); // Remove empty lines
      if (!sitemap.includes(link)) {
        sitemap.push(link);
        fs.writeFileSync(filePath, sitemap.join("\n"));
      }
    } else {
      fs.writeFileSync(filePath, link);
    }
  } else {
    // Create the file and add the link if it doesn't exist
    fs.writeFileSync(filePath, link);
  }
};

export const removeFromSitemap = (link: string) => {
  const filePath = path.join(__dirname, "../sitemap.txt");

  // Check if file exists
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");

    // Handle the case where the file is empty
    if (data) {
      const sitemap = data.split("\n").filter(Boolean); // Remove empty lines
      const updatedSitemap = sitemap.filter((item) => item !== link);
      fs.writeFileSync(filePath, updatedSitemap.join("\n"));
    }
  }
};
