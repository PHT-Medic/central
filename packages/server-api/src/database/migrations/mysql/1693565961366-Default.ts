import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1693565961366 implements MigrationInterface {
    name = 'Default1693565961366';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user_secrets\`
            ADD \`hash\` varchar(128) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_secrets\` CHANGE \`content\` \`content\` text NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user_secrets\` CHANGE \`content\` \`content\` text NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_secrets\` DROP COLUMN \`hash\`
        `);
    }
}
