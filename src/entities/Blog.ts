import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "./Category";
import { Content } from "./Content";
import { Comment } from "./Comment";
import { Tag } from "./Tag";
import { BlogTranslation } from "./BlogTranslation";
import { SubCategory } from "./SubCategory";

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: "varchar" })
  slug!: string;

  @Column({ type: "json", nullable: true })
  mainImage!: any;

  @Column({ type: "varchar", default: "draft" })
  status!: "draft" | "published";

  @Column({ type: "bigint", default: 0 })
  views!: number;

  @Column({ type: "boolean", default: false })
  featured!: boolean;

  @ManyToOne(() => Category, (category) => category.blogs)
  category!: Category;

  @ManyToOne(() => Category, (category) => category.blogs)
  subcategory!: SubCategory;

  @OneToMany(() => Content, (content) => content.blog, {
    cascade: true,
    onDelete: "CASCADE",
  })
  contents!: Content[];

  @OneToMany(() => Comment, (comment) => comment.blog, {
    cascade: true,
    onDelete: "CASCADE",
  })
  comments!: Comment[];

  @ManyToMany(() => Tag, (tag) => tag.blogs, { cascade: true })
  @JoinTable()
  tags!: Tag[];

  @OneToMany(() => BlogTranslation, (translation) => translation.blog, {
    cascade: true,
    onDelete: "CASCADE",
  })
  translations!: BlogTranslation[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
