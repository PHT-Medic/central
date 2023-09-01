import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1693565961366 implements MigrationInterface {
    name = 'Default1693565961366';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_secrets"
            ADD "hash" character varying(128)
        `);
        await queryRunner.query(`
            ALTER TABLE "user_secrets"
            ALTER COLUMN "content"
            SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_secrets"
            ALTER COLUMN "content" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user_secrets" DROP COLUMN "hash"
        `);
    }
}
