import { MigrationInterface, QueryRunner } from 'typeorm';
export class Default1679651496566 implements MigrationInterface {
    name = 'Default1679651496566';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`master_images\` (
                \`id\` varchar(36) NOT NULL,
                \`path\` varchar(255) NULL,
                \`virtual_path\` varchar(256) NOT NULL,
                \`group_virtual_path\` varchar(256) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`command\` text NULL,
                \`command_arguments\` json NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_7c779b370b32ebaed6b9cc7576\` (\`virtual_path\`),
                INDEX \`IDX_f5d09cafff06c3a976ebff5f2a\` (\`group_virtual_path\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`master_image_groups\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(128) NOT NULL,
                \`path\` varchar(512) NOT NULL,
                \`virtual_path\` varchar(256) NOT NULL,
                \`command\` text NULL,
                \`command_arguments\` json NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_fcd0ee59b74408554a14729dcf\` (\`virtual_path\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`proposals\` (
                \`id\` varchar(36) NOT NULL,
                \`title\` varchar(256) NOT NULL,
                \`requested_data\` varchar(255) NOT NULL,
                \`risk\` varchar(64) NOT NULL DEFAULT 'low',
                \`risk_comment\` varchar(4096) NOT NULL,
                \`trains\` int UNSIGNED NOT NULL DEFAULT '0',
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`realm_id\` varchar(255) NOT NULL,
                \`user_id\` varchar(255) NULL,
                \`master_image_id\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`registries\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(128) NOT NULL,
                \`host\` varchar(512) NOT NULL,
                \`ecosystem\` varchar(64) NOT NULL DEFAULT 'tue',
                \`account_name\` varchar(256) NULL,
                \`account_secret\` varchar(256) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`registry_projects\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(128) NOT NULL,
                \`ecosystem\` varchar(64) NOT NULL DEFAULT 'tue',
                \`type\` varchar(64) NULL DEFAULT 'default',
                \`public\` tinyint NOT NULL DEFAULT 1,
                \`external_name\` varchar(64) NOT NULL,
                \`external_id\` varchar(64) NULL,
                \`account_id\` varchar(64) NULL,
                \`account_name\` varchar(256) NULL,
                \`account_secret\` varchar(256) NULL,
                \`webhook_name\` varchar(128) NULL,
                \`webhook_exists\` tinyint NOT NULL DEFAULT 0,
                \`registry_id\` varchar(255) NOT NULL,
                \`realm_id\` varchar(255) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_d64dd084b79703879cc66b3e9c\` (\`external_id\`, \`registry_id\`),
                UNIQUE INDEX \`IDX_1fa5e8b7ffc0786daf0adb941b\` (\`external_name\`, \`registry_id\`),
                UNIQUE INDEX \`IDX_bd7100277fb5331625c2b474ea\` (\`name\`, \`registry_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`stations\` (
                \`id\` varchar(36) NOT NULL,
                \`external_name\` varchar(64) NULL,
                \`name\` varchar(128) NOT NULL,
                \`public_key\` text NULL,
                \`email\` varchar(256) NULL,
                \`ecosystem\` varchar(32) NULL DEFAULT 'tue',
                \`hidden\` tinyint NOT NULL DEFAULT 0,
                \`registry_id\` varchar(255) NULL,
                \`registry_project_id\` varchar(255) NULL,
                \`realm_id\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_d800eab3efc6a62945ef4fb3a1\` (\`name\`, \`realm_id\`),
                UNIQUE INDEX \`station_external_name_index\` (\`external_name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`proposal_stations\` (
                \`id\` varchar(36) NOT NULL,
                \`approval_status\` varchar(255) NULL,
                \`comment\` text NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`proposal_id\` varchar(255) NOT NULL,
                \`proposal_realm_id\` varchar(255) NOT NULL,
                \`station_id\` varchar(255) NOT NULL,
                \`station_realm_id\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_10373be8b66bfc806d714e17d2\` (\`proposal_id\`, \`station_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`train_files\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(256) NOT NULL,
                \`hash\` varchar(4096) NOT NULL,
                \`directory\` varchar(255) NULL,
                \`size\` int UNSIGNED NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`user_id\` varchar(255) NOT NULL,
                \`realm_id\` varchar(255) NOT NULL,
                \`train_id\` varchar(255) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`user_secrets\` (
                \`id\` varchar(36) NOT NULL,
                \`key\` varchar(128) NOT NULL,
                \`type\` varchar(64) NOT NULL,
                \`content\` text NULL,
                \`user_id\` varchar(255) NOT NULL,
                \`realm_id\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`IDX_1fb79b7f53ab551f3ce713bad9\` (\`type\`),
                UNIQUE INDEX \`keyUserId\` (\`key\`, \`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`train_entity\` (
                \`id\` varchar(36) NOT NULL,
                \`type\` varchar(64) NOT NULL DEFAULT 'analyse',
                \`name\` varchar(128) NULL,
                \`query\` text NULL,
                \`hash\` text NULL,
                \`hash_signed\` text NULL,
                \`session_id\` varchar(255) NULL,
                \`entrypoint_file_id\` varchar(255) NULL,
                \`stations\` int UNSIGNED NOT NULL DEFAULT '0',
                \`dummy\` text NOT NULL,
                \`configuration_status\` varchar(64) NULL,
                \`build_status\` varchar(64) NULL,
                \`run_status\` varchar(64) NULL,
                \`run_station_id\` varchar(255) NULL,
                \`run_station_index\` int UNSIGNED NULL,
                \`result_status\` varchar(64) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`incoming_registry_project_id\` varchar(255) NULL,
                \`outgoing_registry_project_id\` varchar(255) NULL,
                \`registry_id\` varchar(255) NULL,
                \`realm_id\` varchar(255) NOT NULL,
                \`user_rsa_secret_id\` varchar(255) NULL,
                \`user_paillier_secret_id\` varchar(255) NULL,
                \`user_id\` varchar(255) NULL,
                \`proposal_id\` varchar(255) NOT NULL,
                \`master_image_id\` varchar(255) NULL,
                INDEX \`IDX_ffeb48386b410cd0238b5758f5\` (\`type\`),
                INDEX \`IDX_ff1003328676db596bdb563387\` (\`name\`),
                INDEX \`IDX_c18eae3bae26a1c4ea8da34d9d\` (\`configuration_status\`),
                INDEX \`IDX_fdf1f1d751c66a8d160c650175\` (\`build_status\`),
                INDEX \`IDX_474056e5a06f82e96522d6eac2\` (\`run_status\`),
                UNIQUE INDEX \`REL_c3404c5af13c46bf0ce572a49b\` (\`entrypoint_file_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`train_stations\` (
                \`id\` varchar(36) NOT NULL,
                \`approval_status\` varchar(255) NULL,
                \`run_status\` varchar(255) NULL,
                \`comment\` text NULL,
                \`index\` int UNSIGNED NULL,
                \`artifact_tag\` varchar(32) NULL,
                \`artifact_digest\` varchar(512) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`train_id\` varchar(255) NOT NULL,
                \`train_realm_id\` varchar(255) NOT NULL,
                \`station_id\` varchar(255) NOT NULL,
                \`station_realm_id\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_a8875fc50368aac318fd849ec1\` (\`station_id\`, \`train_id\`),
                UNIQUE INDEX \`IDX_f005c437d50a2ee578576026aa\` (\`index\`, \`train_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
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
            ALTER TABLE \`proposals\`
            ADD CONSTRAINT \`FK_939e43116b2cd9d5d9476bccfe6\` FOREIGN KEY (\`master_image_id\`) REFERENCES \`master_images\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`registry_projects\`
            ADD CONSTRAINT \`FK_6a9fc1b5ea9c842309b11308fd6\` FOREIGN KEY (\`registry_id\`) REFERENCES \`registries\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`stations\`
            ADD CONSTRAINT \`FK_bda09060505122ca570ed96a882\` FOREIGN KEY (\`registry_id\`) REFERENCES \`registries\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`stations\`
            ADD CONSTRAINT \`FK_67056f28c5ce34053300e2f0348\` FOREIGN KEY (\`registry_project_id\`) REFERENCES \`registry_projects\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposal_stations\`
            ADD CONSTRAINT \`FK_bc110110c7b13f588a9ebfeecc5\` FOREIGN KEY (\`proposal_id\`) REFERENCES \`proposals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposal_stations\`
            ADD CONSTRAINT \`FK_3a2e9992f68c76b8cf8ea80d8f5\` FOREIGN KEY (\`station_id\`) REFERENCES \`stations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_files\`
            ADD CONSTRAINT \`FK_b94260d8f5103a13faecb4565bd\` FOREIGN KEY (\`train_id\`) REFERENCES \`train_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\`
            ADD CONSTRAINT \`FK_c3404c5af13c46bf0ce572a49b2\` FOREIGN KEY (\`entrypoint_file_id\`) REFERENCES \`train_files\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\`
            ADD CONSTRAINT \`FK_1b7054826d95198cbdf7751e7c4\` FOREIGN KEY (\`incoming_registry_project_id\`) REFERENCES \`registry_projects\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\`
            ADD CONSTRAINT \`FK_53a11f94b27b25b78fd27e63723\` FOREIGN KEY (\`outgoing_registry_project_id\`) REFERENCES \`registry_projects\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\`
            ADD CONSTRAINT \`FK_b453df94ba37e4d44ad9d6e1977\` FOREIGN KEY (\`registry_id\`) REFERENCES \`registries\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\`
            ADD CONSTRAINT \`FK_ba4d7dad0311698a27e69d22f3b\` FOREIGN KEY (\`user_rsa_secret_id\`) REFERENCES \`user_secrets\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\`
            ADD CONSTRAINT \`FK_6acd01f1b66adfe979c54d858b7\` FOREIGN KEY (\`user_paillier_secret_id\`) REFERENCES \`user_secrets\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\`
            ADD CONSTRAINT \`FK_6d486ac731936063433530cb091\` FOREIGN KEY (\`proposal_id\`) REFERENCES \`proposals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\`
            ADD CONSTRAINT \`FK_1a5dce25ddd3e35cf448c0ff701\` FOREIGN KEY (\`master_image_id\`) REFERENCES \`master_images\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_stations\`
            ADD CONSTRAINT \`FK_843216da702b05f66e26c858571\` FOREIGN KEY (\`train_id\`) REFERENCES \`train_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_stations\`
            ADD CONSTRAINT \`FK_a5936af38dac4aa90fa6c5f71ae\` FOREIGN KEY (\`station_id\`) REFERENCES \`stations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_logs\`
            ADD CONSTRAINT \`FK_a5c233a9248190263cfacdf07fb\` FOREIGN KEY (\`train_id\`) REFERENCES \`train_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`train_logs\` DROP FOREIGN KEY \`FK_a5c233a9248190263cfacdf07fb\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_stations\` DROP FOREIGN KEY \`FK_a5936af38dac4aa90fa6c5f71ae\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_stations\` DROP FOREIGN KEY \`FK_843216da702b05f66e26c858571\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_1a5dce25ddd3e35cf448c0ff701\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_6d486ac731936063433530cb091\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_6acd01f1b66adfe979c54d858b7\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_ba4d7dad0311698a27e69d22f3b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_b453df94ba37e4d44ad9d6e1977\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_53a11f94b27b25b78fd27e63723\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_1b7054826d95198cbdf7751e7c4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_c3404c5af13c46bf0ce572a49b2\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_files\` DROP FOREIGN KEY \`FK_b94260d8f5103a13faecb4565bd\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposal_stations\` DROP FOREIGN KEY \`FK_3a2e9992f68c76b8cf8ea80d8f5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposal_stations\` DROP FOREIGN KEY \`FK_bc110110c7b13f588a9ebfeecc5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`stations\` DROP FOREIGN KEY \`FK_67056f28c5ce34053300e2f0348\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`stations\` DROP FOREIGN KEY \`FK_bda09060505122ca570ed96a882\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`registry_projects\` DROP FOREIGN KEY \`FK_6a9fc1b5ea9c842309b11308fd6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposals\` DROP FOREIGN KEY \`FK_939e43116b2cd9d5d9476bccfe6\`
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
        await queryRunner.query(`
            DROP INDEX \`IDX_f005c437d50a2ee578576026aa\` ON \`train_stations\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_a8875fc50368aac318fd849ec1\` ON \`train_stations\`
        `);
        await queryRunner.query(`
            DROP TABLE \`train_stations\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_c3404c5af13c46bf0ce572a49b\` ON \`train_entity\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_474056e5a06f82e96522d6eac2\` ON \`train_entity\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_fdf1f1d751c66a8d160c650175\` ON \`train_entity\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_c18eae3bae26a1c4ea8da34d9d\` ON \`train_entity\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_ff1003328676db596bdb563387\` ON \`train_entity\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_ffeb48386b410cd0238b5758f5\` ON \`train_entity\`
        `);
        await queryRunner.query(`
            DROP TABLE \`train_entity\`
        `);
        await queryRunner.query(`
            DROP INDEX \`keyUserId\` ON \`user_secrets\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_1fb79b7f53ab551f3ce713bad9\` ON \`user_secrets\`
        `);
        await queryRunner.query(`
            DROP TABLE \`user_secrets\`
        `);
        await queryRunner.query(`
            DROP TABLE \`train_files\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_10373be8b66bfc806d714e17d2\` ON \`proposal_stations\`
        `);
        await queryRunner.query(`
            DROP TABLE \`proposal_stations\`
        `);
        await queryRunner.query(`
            DROP INDEX \`station_external_name_index\` ON \`stations\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_d800eab3efc6a62945ef4fb3a1\` ON \`stations\`
        `);
        await queryRunner.query(`
            DROP TABLE \`stations\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_bd7100277fb5331625c2b474ea\` ON \`registry_projects\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_1fa5e8b7ffc0786daf0adb941b\` ON \`registry_projects\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_d64dd084b79703879cc66b3e9c\` ON \`registry_projects\`
        `);
        await queryRunner.query(`
            DROP TABLE \`registry_projects\`
        `);
        await queryRunner.query(`
            DROP TABLE \`registries\`
        `);
        await queryRunner.query(`
            DROP TABLE \`proposals\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_fcd0ee59b74408554a14729dcf\` ON \`master_image_groups\`
        `);
        await queryRunner.query(`
            DROP TABLE \`master_image_groups\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_f5d09cafff06c3a976ebff5f2a\` ON \`master_images\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_7c779b370b32ebaed6b9cc7576\` ON \`master_images\`
        `);
        await queryRunner.query(`
            DROP TABLE \`master_images\`
        `);
    }
}
