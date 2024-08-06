import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Blog } from "./Blog";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: "varchar" })
  slug!: string;

  @Column({ type: "varchar" })
  category!: string;

  @OneToMany(() => Blog, (blog) => blog.category)
  blogs!: Blog[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
