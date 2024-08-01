import "reflect-metadata";
import { AppDataSource } from "./config/database";
import app from "./app";

const PORT = parseInt(process.env.SERVER_PORT || "5000");

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
