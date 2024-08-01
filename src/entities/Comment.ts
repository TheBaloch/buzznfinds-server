import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Blog } from "./Blog";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  comment!: string;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn()
  user!: User;

  @ManyToOne(() => Blog, (blog) => blog.comments)
  @JoinColumn()
  blog!: Blog;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
