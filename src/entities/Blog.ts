import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Category } from "./Category";
import { Content } from "./Content";
import { Comment } from "./Comment";

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: "varchar" })
  slug!: string;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "varchar" })
  subtitle!: string;

  @Column({ type: "varchar" })
  mainImagePrompt!: string;

  @Column({ type: "json", nullable: true })
  mainImage!: any;

  @Column({ type: "json", nullable: true })
  author!: any;

  @Column({ type: "varchar", default: "draft" })
  status!: "draft" | "published";

  @ManyToOne(() => Category, (category) => category.blogs)
  category!: Category;

  @OneToOne(() => Content)
  @JoinColumn()
  content!: Content;

  @OneToMany(() => Comment, (comment) => comment.blog)
  comments!: Comment[];
}
