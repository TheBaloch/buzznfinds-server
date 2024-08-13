import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Blog } from "./Blog";

@Entity()
@Index("idx_tag_slug", ["slug"])
export class Tag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: "varchar", length: 50 })
  name!: string;

  @Column({ unique: true, type: "varchar", length: 100 })
  slug!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @ManyToMany(() => Blog, (blog) => blog.tags)
  blogs!: Blog[];
}
