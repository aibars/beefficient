import { MigrationInterface, QueryRunner } from 'typeorm';

const FARMS_PK = 'PK_39aff9c35006b14025bba5a43d9';
const ESTABLISHMENTS_PK = 'PK_7fb6da6c365114ccb61b091bbdf';

/**
 * Farm → Establishment (BFC-35). An establishment belongs to a Company
 * instead of directly to a User.
 *
 * - Renames `farms` → `establishments` and `owner_id` → `company_id`.
 * - Backfills: every user that owned a farm gets a company (reusing an existing
 *   one when present) and `users.company_id` is set if it was still NULL; each
 *   row's `company_id` (which held the owner's user id) is rewritten to that
 *   company's id.
 * - Renames the primary key to TypeORM's default name for `establishments`.
 * - Replaces fk_farms_owner_id (→ users) with fk_establishments_company_id
 *   (→ companies, ON DELETE CASCADE) and idx_farms_owner_id with
 *   idx_establishments_company_id.
 *
 * user_farm.farm_id and farm_join_codes.farm_id reference the table by OID,
 * so their FKs follow the rename and keep pointing at establishments(id).
 */
export class RenameFarmsToEstablishments20261019000014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "farms" DROP CONSTRAINT "fk_farms_owner_id"`,
    );
    await queryRunner.query(`DROP INDEX "idx_farms_owner_id"`);
    await queryRunner.query(`ALTER TABLE "farms" RENAME TO "establishments"`);
    // TypeORM's default PK name is derived from the table name.
    await queryRunner.query(
      `ALTER TABLE "establishments" RENAME CONSTRAINT "${FARMS_PK}" TO "${ESTABLISHMENTS_PK}"`,
    );
    await queryRunner.query(
      `ALTER TABLE "establishments" RENAME COLUMN "owner_id" TO "company_id"`,
    );

    // Give every farm owner without a company one company.
    await queryRunner.query(`
      INSERT INTO "companies" ("owner_id")
      SELECT DISTINCT e."company_id" FROM "establishments" e
      WHERE NOT EXISTS (
        SELECT 1 FROM "companies" c WHERE c."owner_id" = e."company_id"
      )
    `);
    // Link users to their (oldest) company when not linked yet.
    await queryRunner.query(`
      UPDATE "users" u SET "company_id" = c."id"
      FROM (
        SELECT DISTINCT ON ("owner_id") "id", "owner_id" FROM "companies"
        ORDER BY "owner_id", "created_at", "id"
      ) c
      WHERE c."owner_id" = u."id" AND u."company_id" IS NULL
    `);
    // company_id still holds the owner's user id: swap it for the company id.
    await queryRunner.query(`
      UPDATE "establishments" e SET "company_id" = u."company_id"
      FROM "users" u
      WHERE u."id" = e."company_id"
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_establishments_company_id" ON "establishments" ("company_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "establishments" ADD CONSTRAINT "fk_establishments_company_id"
      FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Companies created by up() are kept: they are valid rows on their own and
    // users.company_id may already point at them.
    await queryRunner.query(
      `ALTER TABLE "establishments" DROP CONSTRAINT "fk_establishments_company_id"`,
    );
    await queryRunner.query(`DROP INDEX "idx_establishments_company_id"`);
    await queryRunner.query(`
      UPDATE "establishments" e SET "company_id" = c."owner_id"
      FROM "companies" c
      WHERE c."id" = e."company_id"
    `);
    await queryRunner.query(
      `ALTER TABLE "establishments" RENAME COLUMN "company_id" TO "owner_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "establishments" RENAME CONSTRAINT "${ESTABLISHMENTS_PK}" TO "${FARMS_PK}"`,
    );
    await queryRunner.query(`ALTER TABLE "establishments" RENAME TO "farms"`);
    await queryRunner.query(
      `CREATE INDEX "idx_farms_owner_id" ON "farms" ("owner_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "farms" ADD CONSTRAINT "fk_farms_owner_id"
      FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }
}
