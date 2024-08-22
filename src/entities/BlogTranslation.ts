import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Blog } from "./Blog";

@Entity()
export class BlogTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  language!: string;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "text", nullable: true })
  overview!: string;

  @Column({ type: "varchar" })
  subtitle!: string;

  @Column({ type: "json", nullable: true })
  author!: any;

  @ManyToOne(() => Blog, (blog) => blog.translations)
  @JoinColumn()
  blog!: Blog;
}
