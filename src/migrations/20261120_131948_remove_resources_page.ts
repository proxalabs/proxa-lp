import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "page_resources" CASCADE;
  DROP TABLE "_page_resources_v" CASCADE;
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "cta_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_hero_cta_page";
  CREATE TYPE "public"."enum_pages_blocks_hero_cta_page" AS ENUM('home', 'platform', 'insitex', 'literacy', 'advisory', 'content', 'proxalab', 'blog', 'newsHub', 'news', 'newsletter', 'about', 'contact', '_built');
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "cta_page" SET DATA TYPE "public"."enum_pages_blocks_hero_cta_page" USING "cta_page"::"public"."enum_pages_blocks_hero_cta_page";
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "cta_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_cta_cta_page";
  CREATE TYPE "public"."enum_pages_blocks_cta_cta_page" AS ENUM('home', 'platform', 'insitex', 'literacy', 'advisory', 'content', 'proxalab', 'blog', 'newsHub', 'news', 'newsletter', 'about', 'contact', '_built');
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "cta_page" SET DATA TYPE "public"."enum_pages_blocks_cta_cta_page" USING "cta_page"::"public"."enum_pages_blocks_cta_cta_page";
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "cta_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_hero_cta_page";
  CREATE TYPE "public"."enum__pages_v_blocks_hero_cta_page" AS ENUM('home', 'platform', 'insitex', 'literacy', 'advisory', 'content', 'proxalab', 'blog', 'newsHub', 'news', 'newsletter', 'about', 'contact', '_built');
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "cta_page" SET DATA TYPE "public"."enum__pages_v_blocks_hero_cta_page" USING "cta_page"::"public"."enum__pages_v_blocks_hero_cta_page";
  ALTER TABLE "_pages_v_blocks_cta" ALTER COLUMN "cta_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_cta_cta_page";
  CREATE TYPE "public"."enum__pages_v_blocks_cta_cta_page" AS ENUM('home', 'platform', 'insitex', 'literacy', 'advisory', 'content', 'proxalab', 'blog', 'newsHub', 'news', 'newsletter', 'about', 'contact', '_built');
  ALTER TABLE "_pages_v_blocks_cta" ALTER COLUMN "cta_page" SET DATA TYPE "public"."enum__pages_v_blocks_cta_cta_page" USING "cta_page"::"public"."enum__pages_v_blocks_cta_cta_page";
  ALTER TABLE "navigation_platform" ALTER COLUMN "link_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_navigation_platform_link_page";
  CREATE TYPE "public"."enum_navigation_platform_link_page" AS ENUM('home', 'platform', 'insitex', 'literacy', 'advisory', 'content', 'proxalab', 'blog', 'newsHub', 'news', 'newsletter', 'about', 'contact', '_built');
  ALTER TABLE "navigation_platform" ALTER COLUMN "link_page" SET DATA TYPE "public"."enum_navigation_platform_link_page" USING "link_page"::"public"."enum_navigation_platform_link_page";
  ALTER TABLE "navigation_solutions" ALTER COLUMN "link_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_navigation_solutions_link_page";
  CREATE TYPE "public"."enum_navigation_solutions_link_page" AS ENUM('home', 'platform', 'insitex', 'literacy', 'advisory', 'content', 'proxalab', 'blog', 'newsHub', 'news', 'newsletter', 'about', 'contact', '_built');
  ALTER TABLE "navigation_solutions" ALTER COLUMN "link_page" SET DATA TYPE "public"."enum_navigation_solutions_link_page" USING "link_page"::"public"."enum_navigation_solutions_link_page";
  ALTER TABLE "navigation_resources" ALTER COLUMN "link_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_navigation_resources_link_page";
  CREATE TYPE "public"."enum_navigation_resources_link_page" AS ENUM('home', 'platform', 'insitex', 'literacy', 'advisory', 'content', 'proxalab', 'blog', 'newsHub', 'news', 'newsletter', 'about', 'contact', '_built');
  ALTER TABLE "navigation_resources" ALTER COLUMN "link_page" SET DATA TYPE "public"."enum_navigation_resources_link_page" USING "link_page"::"public"."enum_navigation_resources_link_page";
  ALTER TABLE "_navigation_v_version_platform" ALTER COLUMN "link_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__navigation_v_version_platform_link_page";
  CREATE TYPE "public"."enum__navigation_v_version_platform_link_page" AS ENUM('home', 'platform', 'insitex', 'literacy', 'advisory', 'content', 'proxalab', 'blog', 'newsHub', 'news', 'newsletter', 'about', 'contact', '_built');
  ALTER TABLE "_navigation_v_version_platform" ALTER COLUMN "link_page" SET DATA TYPE "public"."enum__navigation_v_version_platform_link_page" USING "link_page"::"public"."enum__navigation_v_version_platform_link_page";
  ALTER TABLE "_navigation_v_version_solutions" ALTER COLUMN "link_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__navigation_v_version_solutions_link_page";
  CREATE TYPE "public"."enum__navigation_v_version_solutions_link_page" AS ENUM('home', 'platform', 'insitex', 'literacy', 'advisory', 'content', 'proxalab', 'blog', 'newsHub', 'news', 'newsletter', 'about', 'contact', '_built');
  ALTER TABLE "_navigation_v_version_solutions" ALTER COLUMN "link_page" SET DATA TYPE "public"."enum__navigation_v_version_solutions_link_page" USING "link_page"::"public"."enum__navigation_v_version_solutions_link_page";
  ALTER TABLE "_navigation_v_version_resources" ALTER COLUMN "link_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__navigation_v_version_resources_link_page";
  CREATE TYPE "public"."enum__navigation_v_version_resources_link_page" AS ENUM('home', 'platform', 'insitex', 'literacy', 'advisory', 'content', 'proxalab', 'blog', 'newsHub', 'news', 'newsletter', 'about', 'contact', '_built');
  ALTER TABLE "_navigation_v_version_resources" ALTER COLUMN "link_page" SET DATA TYPE "public"."enum__navigation_v_version_resources_link_page" USING "link_page"::"public"."enum__navigation_v_version_resources_link_page";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_hero_cta_page" ADD VALUE 'resources' BEFORE 'blog';
  ALTER TYPE "public"."enum_pages_blocks_cta_cta_page" ADD VALUE 'resources' BEFORE 'blog';
  ALTER TYPE "public"."enum__pages_v_blocks_hero_cta_page" ADD VALUE 'resources' BEFORE 'blog';
  ALTER TYPE "public"."enum__pages_v_blocks_cta_cta_page" ADD VALUE 'resources' BEFORE 'blog';
  ALTER TYPE "public"."enum_navigation_platform_link_page" ADD VALUE 'resources' BEFORE 'blog';
  ALTER TYPE "public"."enum_navigation_solutions_link_page" ADD VALUE 'resources' BEFORE 'blog';
  ALTER TYPE "public"."enum_navigation_resources_link_page" ADD VALUE 'resources' BEFORE 'blog';
  ALTER TYPE "public"."enum__navigation_v_version_platform_link_page" ADD VALUE 'resources' BEFORE 'blog';
  ALTER TYPE "public"."enum__navigation_v_version_solutions_link_page" ADD VALUE 'resources' BEFORE 'blog';
  ALTER TYPE "public"."enum__navigation_v_version_resources_link_page" ADD VALUE 'resources' BEFORE 'blog';
  CREATE TABLE "page_resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar,
  	"hero_headline" varchar,
  	"hero_subhead" varchar,
  	"hero_ctalabel" varchar,
  	"frameworks_eyebrow" varchar,
  	"frameworks_heading" varchar,
  	"frameworks_lead" varchar,
  	"frameworks_cards_0_tag" varchar,
  	"frameworks_cards_0_title" varchar,
  	"frameworks_cards_0_body" varchar,
  	"frameworks_cards_0_linklabel" varchar,
  	"frameworks_cards_1_tag" varchar,
  	"frameworks_cards_1_title" varchar,
  	"frameworks_cards_1_body" varchar,
  	"frameworks_cards_1_linklabel" varchar,
  	"frameworks_cards_2_tag" varchar,
  	"frameworks_cards_2_title" varchar,
  	"frameworks_cards_2_body" varchar,
  	"frameworks_cards_2_linklabel" varchar,
  	"frameworks_cards_3_tag" varchar,
  	"frameworks_cards_3_title" varchar,
  	"frameworks_cards_3_body" varchar,
  	"frameworks_cards_3_linklabel" varchar,
  	"frameworks_cards_4_tag" varchar,
  	"frameworks_cards_4_title" varchar,
  	"frameworks_cards_4_body" varchar,
  	"frameworks_cards_4_linklabel" varchar,
  	"frameworks_cards_5_tag" varchar,
  	"frameworks_cards_5_title" varchar,
  	"frameworks_cards_5_body" varchar,
  	"frameworks_cards_5_linklabel" varchar,
  	"research_eyebrow" varchar,
  	"research_heading" varchar,
  	"research_body" varchar,
  	"research_cards_0_tag" varchar,
  	"research_cards_0_title" varchar,
  	"research_cards_0_body" varchar,
  	"research_cards_1_tag" varchar,
  	"research_cards_1_title" varchar,
  	"research_cards_1_body" varchar,
  	"research_cards_2_tag" varchar,
  	"research_cards_2_title" varchar,
  	"research_cards_2_body" varchar,
  	"cta_heading" varchar,
  	"cta_body" varchar,
  	"cta_ctalabel" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_page_resources_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_eyebrow" varchar,
  	"version_hero_headline" varchar,
  	"version_hero_subhead" varchar,
  	"version_hero_ctalabel" varchar,
  	"version_frameworks_eyebrow" varchar,
  	"version_frameworks_heading" varchar,
  	"version_frameworks_lead" varchar,
  	"version_frameworks_cards_0_tag" varchar,
  	"version_frameworks_cards_0_title" varchar,
  	"version_frameworks_cards_0_body" varchar,
  	"version_frameworks_cards_0_linklabel" varchar,
  	"version_frameworks_cards_1_tag" varchar,
  	"version_frameworks_cards_1_title" varchar,
  	"version_frameworks_cards_1_body" varchar,
  	"version_frameworks_cards_1_linklabel" varchar,
  	"version_frameworks_cards_2_tag" varchar,
  	"version_frameworks_cards_2_title" varchar,
  	"version_frameworks_cards_2_body" varchar,
  	"version_frameworks_cards_2_linklabel" varchar,
  	"version_frameworks_cards_3_tag" varchar,
  	"version_frameworks_cards_3_title" varchar,
  	"version_frameworks_cards_3_body" varchar,
  	"version_frameworks_cards_3_linklabel" varchar,
  	"version_frameworks_cards_4_tag" varchar,
  	"version_frameworks_cards_4_title" varchar,
  	"version_frameworks_cards_4_body" varchar,
  	"version_frameworks_cards_4_linklabel" varchar,
  	"version_frameworks_cards_5_tag" varchar,
  	"version_frameworks_cards_5_title" varchar,
  	"version_frameworks_cards_5_body" varchar,
  	"version_frameworks_cards_5_linklabel" varchar,
  	"version_research_eyebrow" varchar,
  	"version_research_heading" varchar,
  	"version_research_body" varchar,
  	"version_research_cards_0_tag" varchar,
  	"version_research_cards_0_title" varchar,
  	"version_research_cards_0_body" varchar,
  	"version_research_cards_1_tag" varchar,
  	"version_research_cards_1_title" varchar,
  	"version_research_cards_1_body" varchar,
  	"version_research_cards_2_tag" varchar,
  	"version_research_cards_2_title" varchar,
  	"version_research_cards_2_body" varchar,
  	"version_cta_heading" varchar,
  	"version_cta_body" varchar,
  	"version_cta_ctalabel" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "page_resources" ADD CONSTRAINT "page_resources_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_resources_v" ADD CONSTRAINT "_page_resources_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "page_resources_seo_seo_image_idx" ON "page_resources" USING btree ("seo_image_id");
  CREATE INDEX "_page_resources_v_version_seo_version_seo_image_idx" ON "_page_resources_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_page_resources_v_created_at_idx" ON "_page_resources_v" USING btree ("created_at");
  CREATE INDEX "_page_resources_v_updated_at_idx" ON "_page_resources_v" USING btree ("updated_at");`)
}
