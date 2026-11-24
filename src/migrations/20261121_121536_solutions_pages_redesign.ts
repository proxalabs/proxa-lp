import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_advisory" DROP COLUMN "why_pullquote";
  ALTER TABLE "page_advisory" DROP COLUMN "why_pullquoteattribution";
  ALTER TABLE "page_advisory" DROP COLUMN "why_body2";
  ALTER TABLE "page_advisory" DROP COLUMN "why_body3";
  ALTER TABLE "page_advisory" DROP COLUMN "engagements_lead";
  ALTER TABLE "page_advisory" DROP COLUMN "testimonial_author_company";
  ALTER TABLE "_page_advisory_v" DROP COLUMN "version_why_pullquote";
  ALTER TABLE "_page_advisory_v" DROP COLUMN "version_why_pullquoteattribution";
  ALTER TABLE "_page_advisory_v" DROP COLUMN "version_why_body2";
  ALTER TABLE "_page_advisory_v" DROP COLUMN "version_why_body3";
  ALTER TABLE "_page_advisory_v" DROP COLUMN "version_engagements_lead";
  ALTER TABLE "_page_advisory_v" DROP COLUMN "version_testimonial_author_company";
  ALTER TABLE "page_literacy" DROP COLUMN "whyliteracy_pullquote";
  ALTER TABLE "page_literacy" DROP COLUMN "whyliteracy_pullquoteattribution";
  ALTER TABLE "page_literacy" DROP COLUMN "whyliteracy_body1";
  ALTER TABLE "page_literacy" DROP COLUMN "whyliteracy_body2";
  ALTER TABLE "page_literacy" DROP COLUMN "whyliteracy_body3";
  ALTER TABLE "page_literacy" DROP COLUMN "tracks_lead";
  ALTER TABLE "page_literacy" DROP COLUMN "delivery_eyebrow";
  ALTER TABLE "page_literacy" DROP COLUMN "delivery_body";
  ALTER TABLE "_page_literacy_v" DROP COLUMN "version_whyliteracy_pullquote";
  ALTER TABLE "_page_literacy_v" DROP COLUMN "version_whyliteracy_pullquoteattribution";
  ALTER TABLE "_page_literacy_v" DROP COLUMN "version_whyliteracy_body1";
  ALTER TABLE "_page_literacy_v" DROP COLUMN "version_whyliteracy_body2";
  ALTER TABLE "_page_literacy_v" DROP COLUMN "version_whyliteracy_body3";
  ALTER TABLE "_page_literacy_v" DROP COLUMN "version_tracks_lead";
  ALTER TABLE "_page_literacy_v" DROP COLUMN "version_delivery_eyebrow";
  ALTER TABLE "_page_literacy_v" DROP COLUMN "version_delivery_body";
  ALTER TABLE "page_content" DROP COLUMN "tracks_lead";
  ALTER TABLE "page_content" DROP COLUMN "standards_item1_desc";
  ALTER TABLE "page_content" DROP COLUMN "standards_item2_desc";
  ALTER TABLE "page_content" DROP COLUMN "standards_item3_desc";
  ALTER TABLE "page_content" DROP COLUMN "scenario_phase1_body";
  ALTER TABLE "page_content" DROP COLUMN "scenario_phase2_body";
  ALTER TABLE "page_content" DROP COLUMN "scenario_phase3_body";
  ALTER TABLE "page_content" DROP COLUMN "therapeutic_lead";
  ALTER TABLE "_page_content_v" DROP COLUMN "version_tracks_lead";
  ALTER TABLE "_page_content_v" DROP COLUMN "version_standards_item1_desc";
  ALTER TABLE "_page_content_v" DROP COLUMN "version_standards_item2_desc";
  ALTER TABLE "_page_content_v" DROP COLUMN "version_standards_item3_desc";
  ALTER TABLE "_page_content_v" DROP COLUMN "version_scenario_phase1_body";
  ALTER TABLE "_page_content_v" DROP COLUMN "version_scenario_phase2_body";
  ALTER TABLE "_page_content_v" DROP COLUMN "version_scenario_phase3_body";
  ALTER TABLE "_page_content_v" DROP COLUMN "version_therapeutic_lead";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_advisory" ADD COLUMN "why_pullquote" varchar;
  ALTER TABLE "page_advisory" ADD COLUMN "why_pullquoteattribution" varchar;
  ALTER TABLE "page_advisory" ADD COLUMN "why_body2" varchar;
  ALTER TABLE "page_advisory" ADD COLUMN "why_body3" varchar;
  ALTER TABLE "page_advisory" ADD COLUMN "engagements_lead" varchar;
  ALTER TABLE "page_advisory" ADD COLUMN "testimonial_author_company" varchar;
  ALTER TABLE "_page_advisory_v" ADD COLUMN "version_why_pullquote" varchar;
  ALTER TABLE "_page_advisory_v" ADD COLUMN "version_why_pullquoteattribution" varchar;
  ALTER TABLE "_page_advisory_v" ADD COLUMN "version_why_body2" varchar;
  ALTER TABLE "_page_advisory_v" ADD COLUMN "version_why_body3" varchar;
  ALTER TABLE "_page_advisory_v" ADD COLUMN "version_engagements_lead" varchar;
  ALTER TABLE "_page_advisory_v" ADD COLUMN "version_testimonial_author_company" varchar;
  ALTER TABLE "page_literacy" ADD COLUMN "whyliteracy_pullquote" varchar;
  ALTER TABLE "page_literacy" ADD COLUMN "whyliteracy_pullquoteattribution" varchar;
  ALTER TABLE "page_literacy" ADD COLUMN "whyliteracy_body1" varchar;
  ALTER TABLE "page_literacy" ADD COLUMN "whyliteracy_body2" varchar;
  ALTER TABLE "page_literacy" ADD COLUMN "whyliteracy_body3" varchar;
  ALTER TABLE "page_literacy" ADD COLUMN "tracks_lead" varchar;
  ALTER TABLE "page_literacy" ADD COLUMN "delivery_eyebrow" varchar;
  ALTER TABLE "page_literacy" ADD COLUMN "delivery_body" varchar;
  ALTER TABLE "_page_literacy_v" ADD COLUMN "version_whyliteracy_pullquote" varchar;
  ALTER TABLE "_page_literacy_v" ADD COLUMN "version_whyliteracy_pullquoteattribution" varchar;
  ALTER TABLE "_page_literacy_v" ADD COLUMN "version_whyliteracy_body1" varchar;
  ALTER TABLE "_page_literacy_v" ADD COLUMN "version_whyliteracy_body2" varchar;
  ALTER TABLE "_page_literacy_v" ADD COLUMN "version_whyliteracy_body3" varchar;
  ALTER TABLE "_page_literacy_v" ADD COLUMN "version_tracks_lead" varchar;
  ALTER TABLE "_page_literacy_v" ADD COLUMN "version_delivery_eyebrow" varchar;
  ALTER TABLE "_page_literacy_v" ADD COLUMN "version_delivery_body" varchar;
  ALTER TABLE "page_content" ADD COLUMN "tracks_lead" varchar;
  ALTER TABLE "page_content" ADD COLUMN "standards_item1_desc" varchar;
  ALTER TABLE "page_content" ADD COLUMN "standards_item2_desc" varchar;
  ALTER TABLE "page_content" ADD COLUMN "standards_item3_desc" varchar;
  ALTER TABLE "page_content" ADD COLUMN "scenario_phase1_body" varchar;
  ALTER TABLE "page_content" ADD COLUMN "scenario_phase2_body" varchar;
  ALTER TABLE "page_content" ADD COLUMN "scenario_phase3_body" varchar;
  ALTER TABLE "page_content" ADD COLUMN "therapeutic_lead" varchar;
  ALTER TABLE "_page_content_v" ADD COLUMN "version_tracks_lead" varchar;
  ALTER TABLE "_page_content_v" ADD COLUMN "version_standards_item1_desc" varchar;
  ALTER TABLE "_page_content_v" ADD COLUMN "version_standards_item2_desc" varchar;
  ALTER TABLE "_page_content_v" ADD COLUMN "version_standards_item3_desc" varchar;
  ALTER TABLE "_page_content_v" ADD COLUMN "version_scenario_phase1_body" varchar;
  ALTER TABLE "_page_content_v" ADD COLUMN "version_scenario_phase2_body" varchar;
  ALTER TABLE "_page_content_v" ADD COLUMN "version_scenario_phase3_body" varchar;
  ALTER TABLE "_page_content_v" ADD COLUMN "version_therapeutic_lead" varchar;`)
}
