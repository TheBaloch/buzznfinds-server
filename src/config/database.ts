import { DataSource } from "typeorm";
import { User } from "../entities/User";

import * as dotenv from "dotenv";
import { Blog } from "../entities/Blog";
import { Category } from "../entities/Category";
import { Comment } from "../entities/Comment";
import { Content } from "../entities/Content";
import { SiteSettings } from "../entities/SiteSettings";
import { Tag } from "../entities/Tag";
import { BlogTranslation } from "../entities/BlogTranslation";
import { SubCategory } from "../entities/SubCategory";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "blog",
  entities: [
    User,
    Blog,
    Category,
    Comment,
    Content,
    SiteSettings,
    Tag,
    BlogTranslation,
    SubCategory,
  ],
  synchronize: process.env.DB_SYNCHRONIZE === "true",
});
