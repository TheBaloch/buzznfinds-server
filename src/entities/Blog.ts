import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "./Category";
import { Content } from "./Content";
import { Comment } from "./Comment";
import { Tag } from "./Tag";

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: "varchar" })
  slug!: string;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "text" })
  overview!: string;

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

  @Column({ type: "bigint", default: 0 })
  views!: number;

  @Column({ type: "boolean", default: false })
  featured!: boolean;

  @ManyToOne(() => Category, (category) => category.blogs)
  category!: Category;

  @OneToOne(() => Content, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  content!: Content;

  @OneToMany(() => Comment, (comment) => comment.blog, {
    cascade: true,
    onDelete: "CASCADE",
  })
  comments!: Comment[];

  @ManyToMany(() => Tag, (tag) => tag.blogs, { cascade: true })
  @JoinTable()
  tags!: Tag[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
