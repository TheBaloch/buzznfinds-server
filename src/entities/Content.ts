import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Blog } from "./Blog";

@Entity()
export class Content {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  language!: string;

  @Column({ type: "text" })
  introduction!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "text", nullable: true })
  content1!: string;

  @Column({ type: "text", nullable: true })
  content2!: string;

  @Column({ type: "json" })
  SEO!: any;

  @Column({ type: "text", nullable: true })
  cta!: string;

  @Column({ type: "varchar", nullable: true })
  cta_link!: string;

  @Column({ type: "varchar", nullable: true })
  cta_type!: string;

  @Column({ type: "text" })
  conclusion!: string;

  @ManyToOne(() => Blog, (blog) => blog.contents)
  blog!: Blog;
}
