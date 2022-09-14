import { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1663071679702 implements MigrationInterface {
    name = 'Default1663071679702';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`train_logs\` (
                \`id\` varchar(36) NOT NULL,
                \`component\` varchar(64) NULL,
                \`command\` varchar(64) NULL,
                \`event\` varchar(64) NULL,
                \`step\` varchar(64) NULL,
                \`error\` tinyint NOT NULL DEFAULT 0,
                \`error_code\` varchar(64) NULL,
                \`status\` varchar(64) NULL,
                \`status_message\` text NULL,
                \`meta\` text NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`train_id\` varchar(255) NOT NULL,
                \`realm_id\` varchar(255) NOT NULL,
                INDEX \`IDX_10263b5b69c6cf8fd525f32e1a\` (\`component\`),
                INDEX \`IDX_82f08533c80a89ad9d5fc13a5b\` (\`command\`),
                INDEX \`IDX_5a9c144ceca9d04d7b95c1a9ff\` (\`step\`),
                INDEX \`IDX_1f17a2029a3b579c51824b943b\` (\`status\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_logs\`
            ADD CONSTRAINT \`FK_a5c233a9248190263cfacdf07fb\` FOREIGN KEY (\`train_id\`) REFERENCES \`train_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_logs\`
            ADD CONSTRAINT \`FK_531bffd9804d04e892959f7799e\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`train_logs\` DROP FOREIGN KEY \`FK_531bffd9804d04e892959f7799e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_logs\` DROP FOREIGN KEY \`FK_a5c233a9248190263cfacdf07fb\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_1f17a2029a3b579c51824b943b\` ON \`train_logs\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_5a9c144ceca9d04d7b95c1a9ff\` ON \`train_logs\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_82f08533c80a89ad9d5fc13a5b\` ON \`train_logs\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_10263b5b69c6cf8fd525f32e1a\` ON \`train_logs\`
        `);
        await queryRunner.query(`
            DROP TABLE \`train_logs\`
        `);
    }
}
