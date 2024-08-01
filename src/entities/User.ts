import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import bcrypt from "bcryptjs";
import { Comment } from "./Comment";
import { v4 as uuidv4 } from "uuid";
import { sendVerifyEmail } from "../utils/mailer/sendMail";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: "varchar" })
  email!: string;

  @Column({ type: "varchar" })
  password!: string;

  @Column({ type: "varchar", nullable: true })
  username!: string;

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @Column({ type: "varchar", nullable: true })
  phone!: string;

  @Column({ type: "json", nullable: true })
  address: any;

  @Column({ type: "json", nullable: true })
  profile_image: any = {};

  @Column({ type: "varchar" })
  role: string = "user";

  @Column({ type: "boolean", default: false })
  isEmailVerified: boolean = false;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @Column({ type: "varchar", nullable: true })
  emailVerificationToken: string | null = null;

  @Column({ type: "varchar", nullable: true })
  passwordVerificationToken: string | null = null;

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // @BeforeInsert()
  // async sendVerificationEmail() {
  //   this.emailVerificationToken = uuidv4();
  //   await sendVerifyEmail(
  //     this.email,
  //     `${this.firstname} ${this.lastname}`,
  //     this.emailVerificationToken
  //   );
  // }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    if (this.password && this.password.length < 60) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error("Invalid email format");
    }
  }
}
