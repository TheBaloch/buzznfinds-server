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
export class SubCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: "varchar" })
  slug!: string;

  @Column({ type: "varchar" })
  name!: string;

  @OneToMany(() => Blog, (blog) => blog.subcategory)
  blogs!: Blog[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
