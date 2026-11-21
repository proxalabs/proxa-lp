import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_home" ADD COLUMN "whatsnew_label" varchar;
  ALTER TABLE "page_home" ADD COLUMN "whatsnew_link" varchar;
  ALTER TABLE "_page_home_v" ADD COLUMN "version_whatsnew_label" varchar;
  ALTER TABLE "_page_home_v" ADD COLUMN "version_whatsnew_link" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_home" DROP COLUMN "whatsnew_label";
  ALTER TABLE "page_home" DROP COLUMN "whatsnew_link";
  ALTER TABLE "_page_home_v" DROP COLUMN "version_whatsnew_label";
  ALTER TABLE "_page_home_v" DROP COLUMN "version_whatsnew_link";`)
}
