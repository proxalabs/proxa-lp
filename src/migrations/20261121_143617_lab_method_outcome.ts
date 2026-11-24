import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_proxalab" ADD COLUMN "phases_outcome" varchar;
  ALTER TABLE "_page_proxalab_v" ADD COLUMN "version_phases_outcome" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_proxalab" DROP COLUMN "phases_outcome";
  ALTER TABLE "_page_proxalab_v" DROP COLUMN "version_phases_outcome";`)
}
