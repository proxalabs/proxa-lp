import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_content" DROP COLUMN "cta_heading";
  ALTER TABLE "page_content" DROP COLUMN "cta_body";
  ALTER TABLE "page_content" DROP COLUMN "cta_ctalabel";
  ALTER TABLE "_page_content_v" DROP COLUMN "version_cta_heading";
  ALTER TABLE "_page_content_v" DROP COLUMN "version_cta_body";
  ALTER TABLE "_page_content_v" DROP COLUMN "version_cta_ctalabel";
  ALTER TABLE "page_proxalab" DROP COLUMN "longform_eyebrow";
  ALTER TABLE "page_proxalab" DROP COLUMN "longform_heading";
  ALTER TABLE "page_proxalab" DROP COLUMN "longform_p1";
  ALTER TABLE "page_proxalab" DROP COLUMN "longform_p2";
  ALTER TABLE "page_proxalab" DROP COLUMN "longform_p3";
  ALTER TABLE "page_proxalab" DROP COLUMN "failures_lead";
  ALTER TABLE "page_proxalab" DROP COLUMN "phases_lead";
  ALTER TABLE "page_proxalab" DROP COLUMN "research_lead";
  ALTER TABLE "page_proxalab" DROP COLUMN "cta_heading";
  ALTER TABLE "page_proxalab" DROP COLUMN "cta_body";
  ALTER TABLE "page_proxalab" DROP COLUMN "cta_ctalabel";
  ALTER TABLE "_page_proxalab_v" DROP COLUMN "version_longform_eyebrow";
  ALTER TABLE "_page_proxalab_v" DROP COLUMN "version_longform_heading";
  ALTER TABLE "_page_proxalab_v" DROP COLUMN "version_longform_p1";
  ALTER TABLE "_page_proxalab_v" DROP COLUMN "version_longform_p2";
  ALTER TABLE "_page_proxalab_v" DROP COLUMN "version_longform_p3";
  ALTER TABLE "_page_proxalab_v" DROP COLUMN "version_failures_lead";
  ALTER TABLE "_page_proxalab_v" DROP COLUMN "version_phases_lead";
  ALTER TABLE "_page_proxalab_v" DROP COLUMN "version_research_lead";
  ALTER TABLE "_page_proxalab_v" DROP COLUMN "version_cta_heading";
  ALTER TABLE "_page_proxalab_v" DROP COLUMN "version_cta_body";
  ALTER TABLE "_page_proxalab_v" DROP COLUMN "version_cta_ctalabel";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_content" ADD COLUMN "cta_heading" varchar;
  ALTER TABLE "page_content" ADD COLUMN "cta_body" varchar;
  ALTER TABLE "page_content" ADD COLUMN "cta_ctalabel" varchar;
  ALTER TABLE "_page_content_v" ADD COLUMN "version_cta_heading" varchar;
  ALTER TABLE "_page_content_v" ADD COLUMN "version_cta_body" varchar;
  ALTER TABLE "_page_content_v" ADD COLUMN "version_cta_ctalabel" varchar;
  ALTER TABLE "page_proxalab" ADD COLUMN "longform_eyebrow" varchar;
  ALTER TABLE "page_proxalab" ADD COLUMN "longform_heading" varchar;
  ALTER TABLE "page_proxalab" ADD COLUMN "longform_p1" varchar;
  ALTER TABLE "page_proxalab" ADD COLUMN "longform_p2" varchar;
  ALTER TABLE "page_proxalab" ADD COLUMN "longform_p3" varchar;
  ALTER TABLE "page_proxalab" ADD COLUMN "failures_lead" varchar;
  ALTER TABLE "page_proxalab" ADD COLUMN "phases_lead" varchar;
  ALTER TABLE "page_proxalab" ADD COLUMN "research_lead" varchar;
  ALTER TABLE "page_proxalab" ADD COLUMN "cta_heading" varchar;
  ALTER TABLE "page_proxalab" ADD COLUMN "cta_body" varchar;
  ALTER TABLE "page_proxalab" ADD COLUMN "cta_ctalabel" varchar;
  ALTER TABLE "_page_proxalab_v" ADD COLUMN "version_longform_eyebrow" varchar;
  ALTER TABLE "_page_proxalab_v" ADD COLUMN "version_longform_heading" varchar;
  ALTER TABLE "_page_proxalab_v" ADD COLUMN "version_longform_p1" varchar;
  ALTER TABLE "_page_proxalab_v" ADD COLUMN "version_longform_p2" varchar;
  ALTER TABLE "_page_proxalab_v" ADD COLUMN "version_longform_p3" varchar;
  ALTER TABLE "_page_proxalab_v" ADD COLUMN "version_failures_lead" varchar;
  ALTER TABLE "_page_proxalab_v" ADD COLUMN "version_phases_lead" varchar;
  ALTER TABLE "_page_proxalab_v" ADD COLUMN "version_research_lead" varchar;
  ALTER TABLE "_page_proxalab_v" ADD COLUMN "version_cta_heading" varchar;
  ALTER TABLE "_page_proxalab_v" ADD COLUMN "version_cta_body" varchar;
  ALTER TABLE "_page_proxalab_v" ADD COLUMN "version_cta_ctalabel" varchar;`)
}
