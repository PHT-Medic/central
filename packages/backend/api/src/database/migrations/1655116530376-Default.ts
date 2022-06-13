import { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1655116530376 implements MigrationInterface {
    name = 'Default1655116530376';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`registry_projects\`
            ADD \`realm_id\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`registry_projects\`
            ADD CONSTRAINT \`FK_0fadd5dc84495e2be1d98f22628\` FOREIGN KEY (\`realm_id\`) REFERENCES \`registries\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`registry_projects\` DROP FOREIGN KEY \`FK_0fadd5dc84495e2be1d98f22628\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`registry_projects\` DROP COLUMN \`realm_id\`
        `);
    }
}
