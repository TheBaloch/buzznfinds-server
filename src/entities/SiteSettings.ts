import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class SiteSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  siteTitle!: string;

  @Column({ type: "text", nullable: true })
  siteDescription!: string;

  @Column({ type: "json", nullable: true })
  siteKeywords!: string[];

  @Column({ type: "varchar", length: 255, nullable: true })
  siteURL!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  faviconURL!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  defaultMetaTitle!: string;

  @Column({ type: "text", nullable: true })
  defaultMetaDescription!: string;

  @Column({ type: "json", nullable: true })
  defaultMetaKeywords!: string[];

  @Column({ type: "varchar", length: 255, nullable: true })
  ogTitle!: string;

  @Column({ type: "text", nullable: true })
  ogDescription!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  ogImageURL!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  ogType!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  ogURL!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  twitterCardType!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  twitterTitle!: string;

  @Column({ type: "text", nullable: true })
  twitterDescription!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  twitterImageURL!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  twitterSiteHandle!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  twitterCreatorHandle!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  organizationName!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  organizationLogoURL!: string;

  @Column({ type: "json", nullable: true })
  contactInformation!: any;

  @Column({ type: "json", nullable: true })
  socialProfiles!: string[];

  @Column({ type: "text", nullable: true })
  robotsTxtContent!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  sitemapURL!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  defaultCanonicalURL!: string;

  @Column({ type: "boolean", default: false })
  breadcrumbsEnabled!: boolean;

  @Column({ type: "text", nullable: true })
  breadcrumbsSchema!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  analyticsTrackingID!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  googleSearchConsoleVerificationCode!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  bingWebmasterToolsVerificationCode!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  facebookPixelID!: string;
}
