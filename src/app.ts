import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import passport from "./auth/jwt";
import { errorHandler } from "./middlewares/errorHandler";
import client from "./utils/cache";
import dotenv from "dotenv";
import path from "path";

dotenv.config(); //env file read

//Routes Import
import userRoutes from "./routes/userRoutes";
import blogRoutes from "./routes/blogRoutes";
import siteSettingRoutes from "./routes/siteSettingsRoutes";

const app = express();

// Cookie Parser
app.use(cookieParser());

// Security middlewares
app.use(helmet());
//app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(bodyParser.json({ limit: "10mb" }));

app.use(cors());
app.set("trust proxy", 1);

// Initialize passport
app.use(passport.initialize());

// Error Handler
app.use(errorHandler);

const staticFilesPath = path.resolve(
  __dirname,
  process.env.STATIC_FILES_PATH || "../public"
);

async function startServer() {
  //Routes
  app.use("/api/sitemap.txt", (req, res) => {
    res.sendFile(path.join(__dirname, "sitemap.txt"));
  });
  app.use("/api", userRoutes);
  app.use("/api", blogRoutes);
  app.use("/api", siteSettingRoutes);
  app.use("/api/public", express.static(staticFilesPath));

  //Cache
  if (process.env.REDIS_ENABLED === "true") client.connect();
}
startServer().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});

export default app;
