import { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1653907189541 implements MigrationInterface {
    name = 'Default1653907189541';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`auth_realms\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(128) NOT NULL,
                \`description\` text NULL,
                \`drop_able\` tinyint NOT NULL DEFAULT 1,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_9b95dc8c08d8b11a80a6798a64\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_user_attributes\` (
                \`id\` varchar(36) NOT NULL,
                \`key\` varchar(255) NOT NULL,
                \`value\` text NOT NULL,
                \`realm_id\` varchar(255) NOT NULL,
                \`user_id\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_6e9c808870bd74d6806b6f7641\` (\`key\`, \`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_users\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(128) NOT NULL,
                \`name_locked\` tinyint NOT NULL DEFAULT 1,
                \`first_name\` varchar(128) NULL,
                \`last_name\` varchar(128) NULL,
                \`display_name\` varchar(128) NOT NULL,
                \`email\` varchar(256) NULL,
                \`password\` varchar(512) NULL,
                \`avatar\` varchar(255) NULL,
                \`cover\` varchar(255) NULL,
                \`reset_hash\` varchar(256) NULL,
                \`reset_at\` datetime NULL,
                \`reset_expires\` datetime NULL,
                \`status\` varchar(256) NULL,
                \`status_message\` varchar(256) NULL,
                \`active\` tinyint NOT NULL DEFAULT 1,
                \`activate_hash\` varchar(256) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`realm_id\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_2d54113aa2edfc3955abcf524a\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_role_attributes\` (
                \`id\` varchar(36) NOT NULL,
                \`key\` varchar(255) NOT NULL,
                \`value\` text NOT NULL,
                \`realm_id\` varchar(255) NULL,
                \`role_id\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_41888f98e345dc95d98066c872\` (\`key\`, \`role_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_roles\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(64) NOT NULL,
                \`target\` varchar(16) NULL,
                \`description\` text NULL,
                \`realm_id\` varchar(255) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_6e74f330e34555ae90068b0392\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_permissions\` (
                \`id\` varchar(128) NOT NULL,
                \`target\` varchar(16) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_role_permissions\` (
                \`id\` varchar(36) NOT NULL,
                \`power\` int NOT NULL DEFAULT '999',
                \`condition\` text NULL,
                \`fields\` text NULL,
                \`negation\` tinyint NOT NULL DEFAULT 0,
                \`target\` varchar(16) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`role_id\` varchar(255) NOT NULL,
                \`role_realm_id\` varchar(255) NULL,
                \`permission_id\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_40c0ee0929b20575df125e8d14\` (\`permission_id\`, \`role_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_user_roles\` (
                \`id\` varchar(36) NOT NULL,
                \`role_id\` varchar(255) NOT NULL,
                \`role_realm_id\` varchar(255) NULL,
                \`user_id\` varchar(255) NOT NULL,
                \`user_realm_id\` varchar(255) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_e1aaaa657b3c0615f6b4a6e657\` (\`role_id\`, \`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_user_permissions\` (
                \`id\` varchar(36) NOT NULL,
                \`power\` int NOT NULL DEFAULT '999',
                \`condition\` text NULL,
                \`fields\` text NULL,
                \`negation\` tinyint NOT NULL DEFAULT 0,
                \`target\` varchar(16) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`user_id\` varchar(255) NOT NULL,
                \`user_realm_id\` varchar(255) NULL,
                \`permission_id\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_e1a21fc2e6ac12fa29b02c4382\` (\`permission_id\`, \`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_robots\` (
                \`id\` varchar(36) NOT NULL,
                \`secret\` varchar(256) NOT NULL,
                \`name\` varchar(128) NOT NULL,
                \`description\` text NULL,
                \`active\` tinyint NOT NULL DEFAULT 1,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`user_id\` varchar(255) NULL,
                \`realm_id\` varchar(255) NOT NULL DEFAULT 'master',
                UNIQUE INDEX \`IDX_f32b0b8138a40ced608c7cfc3e\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_robot_roles\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`role_id\` varchar(255) NOT NULL,
                \`role_realm_id\` varchar(255) NULL,
                \`robot_id\` varchar(255) NOT NULL,
                \`robot_realm_id\` varchar(255) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`client_id\` varchar(36) NULL,
                UNIQUE INDEX \`IDX_515b3dc84ba9bec42bd0e92cbd\` (\`role_id\`, \`robot_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_robot_permissions\` (
                \`id\` varchar(36) NOT NULL,
                \`power\` int NOT NULL DEFAULT '999',
                \`condition\` text NULL,
                \`fields\` text NULL,
                \`negation\` tinyint NOT NULL DEFAULT 0,
                \`target\` varchar(16) NULL,
                \`robot_id\` varchar(255) NOT NULL,
                \`robot_realm_id\` varchar(255) NULL,
                \`permission_id\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_0c2284272043ed8aba6689306b\` (\`permission_id\`, \`robot_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_clients\` (
                \`id\` varchar(36) NOT NULL,
                \`secret\` varchar(256) NULL,
                \`redirect_url\` varchar(512) NULL,
                \`grant_types\` varchar(512) NULL,
                \`scope\` varchar(512) NULL,
                \`is_confidential\` tinyint NOT NULL DEFAULT 1,
                \`user_id\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_access_tokens\` (
                \`id\` varchar(255) NOT NULL,
                \`content\` varchar(4096) NOT NULL,
                \`expires\` datetime NOT NULL,
                \`scope\` varchar(512) NULL,
                \`client_id\` varchar(255) NULL,
                \`user_id\` varchar(255) NULL,
                \`robot_id\` varchar(255) NULL,
                \`realm_id\` varchar(255) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_oauth2_providers\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(36) NOT NULL,
                \`open_id\` tinyint NOT NULL DEFAULT 0,
                \`client_id\` varchar(256) NOT NULL,
                \`client_secret\` varchar(256) NULL,
                \`token_host\` varchar(256) NULL,
                \`token_path\` varchar(128) NULL,
                \`token_revoke_path\` varchar(128) NULL,
                \`authorize_host\` varchar(256) NULL,
                \`authorize_path\` varchar(128) NULL,
                \`user_info_host\` varchar(256) NULL,
                \`user_info_path\` varchar(128) NULL,
                \`scope\` varchar(255) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`realm_id\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_4dbdee0f1355d411972939967d\` (\`name\`, \`realm_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_oauth2_provider_accounts\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`access_token\` text NULL,
                \`refresh_token\` text NULL,
                \`provider_user_id\` varchar(256) NOT NULL,
                \`provider_user_name\` varchar(256) NULL,
                \`provider_user_email\` varchar(512) NULL,
                \`expires_in\` int UNSIGNED NULL,
                \`expires_at\` datetime NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`user_id\` varchar(255) NOT NULL,
                \`provider_id\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_54525c92a39b98d1b0b03ad708\` (\`provider_id\`, \`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_oauth2_provider_roles\` (
                \`id\` varchar(36) NOT NULL,
                \`external_id\` varchar(36) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`role_id\` varchar(255) NOT NULL,
                \`role_realm_id\` varchar(255) NULL,
                \`provider_id\` varchar(255) NOT NULL,
                \`provider_realm_id\` varchar(255) NULL,
                UNIQUE INDEX \`IDX_17c48da30a878499a38ac7e47c\` (\`provider_id\`, \`external_id\`),
                UNIQUE INDEX \`IDX_039f19cbf8eadd18be864fe0c6\` (\`provider_id\`, \`role_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_refresh_tokens\` (
                \`id\` varchar(255) NOT NULL,
                \`expires\` datetime NOT NULL,
                \`scope\` varchar(512) NULL,
                \`client_id\` varchar(255) NULL,
                \`access_token_id\` varchar(255) NULL,
                \`realm_id\` varchar(255) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
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
                \`user_id\` varchar(255) NOT NULL,
                \`master_image_id\` varchar(255) NULL,
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
                \`train_id\` varchar(255) NOT NULL,
                \`realm_id\` varchar(255) NULL,
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
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`registry_project_external_id_registry_index\` (\`external_id\`, \`registry_id\`),
                UNIQUE INDEX \`registry_project_external_name_registry_index\` (\`external_name\`, \`registry_id\`),
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
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`realm_id\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_d800eab3efc6a62945ef4fb3a1\` (\`name\`, \`realm_id\`),
                UNIQUE INDEX \`station_external_name_index\` (\`external_name\`),
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
            ALTER TABLE \`auth_user_attributes\`
            ADD CONSTRAINT \`FK_9a84db5a27d34b31644b54d9106\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_attributes\`
            ADD CONSTRAINT \`FK_f50fe4004312e972a547c0e945e\` FOREIGN KEY (\`user_id\`) REFERENCES \`auth_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_users\`
            ADD CONSTRAINT \`FK_1d5fcbfcbba74381ca8a58a3f17\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_role_attributes\`
            ADD CONSTRAINT \`FK_2ba00548c512fffe2e5bf4bb3ff\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_role_attributes\`
            ADD CONSTRAINT \`FK_cd014be6be330f64b8405d0c72a\` FOREIGN KEY (\`role_id\`) REFERENCES \`auth_roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_roles\`
            ADD CONSTRAINT \`FK_063e4bd5b708c304b51b7ee7743\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_role_permissions\`
            ADD CONSTRAINT \`FK_3a6789765734cf5f3f555f2098f\` FOREIGN KEY (\`role_id\`) REFERENCES \`auth_roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_role_permissions\`
            ADD CONSTRAINT \`FK_3d29528c774bc47404659fad030\` FOREIGN KEY (\`role_realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_role_permissions\`
            ADD CONSTRAINT \`FK_4bbe0c540b241ca21e4bd1d8d12\` FOREIGN KEY (\`permission_id\`) REFERENCES \`auth_permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_roles\`
            ADD CONSTRAINT \`FK_866cd5c92b05353aab240bdc10a\` FOREIGN KEY (\`role_id\`) REFERENCES \`auth_roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_roles\`
            ADD CONSTRAINT \`FK_77fe9d38c984c640fc155503c4f\` FOREIGN KEY (\`role_realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_roles\`
            ADD CONSTRAINT \`FK_a3a59104c9c9f2a2458972bc96d\` FOREIGN KEY (\`user_id\`) REFERENCES \`auth_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_roles\`
            ADD CONSTRAINT \`FK_6161ccebf3af1c475758651de49\` FOREIGN KEY (\`user_realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_permissions\`
            ADD CONSTRAINT \`FK_c1d4523b08aa27f07dff798f8d6\` FOREIGN KEY (\`user_id\`) REFERENCES \`auth_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_permissions\`
            ADD CONSTRAINT \`FK_5bf6d1affe0575299c44bc58c06\` FOREIGN KEY (\`user_realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_permissions\`
            ADD CONSTRAINT \`FK_cf962d70634dedf7812fc28282a\` FOREIGN KEY (\`permission_id\`) REFERENCES \`auth_permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robots\`
            ADD CONSTRAINT \`FK_b6d73e3026e15c0af6c41ef8139\` FOREIGN KEY (\`user_id\`) REFERENCES \`auth_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robots\`
            ADD CONSTRAINT \`FK_9c99802f3f360718344180c3f68\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_roles\`
            ADD CONSTRAINT \`FK_2256b04cbdb1e16e5144e14750b\` FOREIGN KEY (\`role_id\`) REFERENCES \`auth_roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_roles\`
            ADD CONSTRAINT \`FK_28146c7babddcad18116dabfa9e\` FOREIGN KEY (\`role_realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_roles\`
            ADD CONSTRAINT \`FK_a4904e9c921294c80f75a0c3e02\` FOREIGN KEY (\`client_id\`) REFERENCES \`auth_robots\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_roles\`
            ADD CONSTRAINT \`FK_21994ec834c710276cce38c779d\` FOREIGN KEY (\`robot_realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_permissions\`
            ADD CONSTRAINT \`FK_5af2884572a617e2532410f8221\` FOREIGN KEY (\`robot_id\`) REFERENCES \`auth_robots\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_permissions\`
            ADD CONSTRAINT \`FK_d52ab826ee04e008624df74cdc8\` FOREIGN KEY (\`robot_realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_permissions\`
            ADD CONSTRAINT \`FK_b29fe901137f6944ecaf98fcb5a\` FOREIGN KEY (\`permission_id\`) REFERENCES \`auth_permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_clients\`
            ADD CONSTRAINT \`FK_9c9f985a5cfc1ff52a04c05e5d5\` FOREIGN KEY (\`user_id\`) REFERENCES \`auth_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_access_tokens\`
            ADD CONSTRAINT \`FK_0f843d99462f485cf847db9b8cf\` FOREIGN KEY (\`client_id\`) REFERENCES \`auth_clients\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_access_tokens\`
            ADD CONSTRAINT \`FK_83d6c9916b02fe7315afb1bcf66\` FOREIGN KEY (\`user_id\`) REFERENCES \`auth_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_access_tokens\`
            ADD CONSTRAINT \`FK_c40e2f3450b458e935784904fc6\` FOREIGN KEY (\`robot_id\`) REFERENCES \`auth_robots\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_access_tokens\`
            ADD CONSTRAINT \`FK_44a975dcfe57d213c19245e77be\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_providers\`
            ADD CONSTRAINT \`FK_07596e87b9baa3122942fc2e0e9\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_provider_accounts\`
            ADD CONSTRAINT \`FK_e18e50974a61970a519ea6a171f\` FOREIGN KEY (\`user_id\`) REFERENCES \`auth_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_provider_accounts\`
            ADD CONSTRAINT \`FK_e284bd0fbef34997a9f035dd741\` FOREIGN KEY (\`provider_id\`) REFERENCES \`auth_oauth2_providers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_provider_roles\`
            ADD CONSTRAINT \`FK_31ba55948469a1d19cd584a03b7\` FOREIGN KEY (\`role_id\`) REFERENCES \`auth_roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_provider_roles\`
            ADD CONSTRAINT \`FK_c89543ffc106639245a4a2b99c8\` FOREIGN KEY (\`role_realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_provider_roles\`
            ADD CONSTRAINT \`FK_9c47ab7df9dc7300b6bca9220d0\` FOREIGN KEY (\`provider_id\`) REFERENCES \`auth_oauth2_providers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_provider_roles\`
            ADD CONSTRAINT \`FK_bbfdff6678f0b3507fef481bc26\` FOREIGN KEY (\`provider_realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_refresh_tokens\`
            ADD CONSTRAINT \`FK_8f611e7ff67a2b013c909f60d52\` FOREIGN KEY (\`client_id\`) REFERENCES \`auth_clients\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_refresh_tokens\`
            ADD CONSTRAINT \`FK_3c95cc8e54e69c3acc2b87bc420\` FOREIGN KEY (\`access_token_id\`) REFERENCES \`auth_access_tokens\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_refresh_tokens\`
            ADD CONSTRAINT \`FK_c1f59fdabbcf5dfd74d6af7f400\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposals\`
            ADD CONSTRAINT \`FK_246a5b565d0976b97af33c6e4da\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposals\`
            ADD CONSTRAINT \`FK_14c5aece4591591d2c3cb8a257d\` FOREIGN KEY (\`user_id\`) REFERENCES \`auth_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposals\`
            ADD CONSTRAINT \`FK_939e43116b2cd9d5d9476bccfe6\` FOREIGN KEY (\`master_image_id\`) REFERENCES \`master_images\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_files\`
            ADD CONSTRAINT \`FK_aef21ee15758fca64be4e7caed4\` FOREIGN KEY (\`user_id\`) REFERENCES \`auth_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_files\`
            ADD CONSTRAINT \`FK_b94260d8f5103a13faecb4565bd\` FOREIGN KEY (\`train_id\`) REFERENCES \`train_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_files\`
            ADD CONSTRAINT \`FK_5601df3f6a788e9525b433c2f2a\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_secrets\`
            ADD CONSTRAINT \`FK_c584286beb5ef2c823312479b4f\` FOREIGN KEY (\`user_id\`) REFERENCES \`auth_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_secrets\`
            ADD CONSTRAINT \`FK_2c326a0ff4b5d126f14203cf3b0\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`registry_projects\`
            ADD CONSTRAINT \`FK_6a9fc1b5ea9c842309b11308fd6\` FOREIGN KEY (\`registry_id\`) REFERENCES \`registries\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
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
            ADD CONSTRAINT \`FK_65ea61524056c08f748367d1b0e\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
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
            ADD CONSTRAINT \`FK_1261a9fe7284cc1a6e5f8fd5d2c\` FOREIGN KEY (\`user_id\`) REFERENCES \`auth_users\`(\`id\`) ON DELETE
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
            ALTER TABLE \`stations\`
            ADD CONSTRAINT \`FK_bda09060505122ca570ed96a882\` FOREIGN KEY (\`registry_id\`) REFERENCES \`registries\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`stations\`
            ADD CONSTRAINT \`FK_67056f28c5ce34053300e2f0348\` FOREIGN KEY (\`registry_project_id\`) REFERENCES \`registry_projects\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`stations\`
            ADD CONSTRAINT \`FK_72f18b596a30267879f2df4f6ba\` FOREIGN KEY (\`realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_stations\`
            ADD CONSTRAINT \`FK_843216da702b05f66e26c858571\` FOREIGN KEY (\`train_id\`) REFERENCES \`train_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_stations\`
            ADD CONSTRAINT \`FK_7c11512d13348f2c87a64b3cf80\` FOREIGN KEY (\`train_realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_stations\`
            ADD CONSTRAINT \`FK_a5936af38dac4aa90fa6c5f71ae\` FOREIGN KEY (\`station_id\`) REFERENCES \`stations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_stations\`
            ADD CONSTRAINT \`FK_b4be42548edc9f6244bb0a78195\` FOREIGN KEY (\`station_realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposal_stations\`
            ADD CONSTRAINT \`FK_bc110110c7b13f588a9ebfeecc5\` FOREIGN KEY (\`proposal_id\`) REFERENCES \`proposals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposal_stations\`
            ADD CONSTRAINT \`FK_6e847394c275332e906dcac67c2\` FOREIGN KEY (\`proposal_realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposal_stations\`
            ADD CONSTRAINT \`FK_3a2e9992f68c76b8cf8ea80d8f5\` FOREIGN KEY (\`station_id\`) REFERENCES \`stations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposal_stations\`
            ADD CONSTRAINT \`FK_4964bb2770bd4ee1eb019235ffa\` FOREIGN KEY (\`station_realm_id\`) REFERENCES \`auth_realms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`proposal_stations\` DROP FOREIGN KEY \`FK_4964bb2770bd4ee1eb019235ffa\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposal_stations\` DROP FOREIGN KEY \`FK_3a2e9992f68c76b8cf8ea80d8f5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposal_stations\` DROP FOREIGN KEY \`FK_6e847394c275332e906dcac67c2\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposal_stations\` DROP FOREIGN KEY \`FK_bc110110c7b13f588a9ebfeecc5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_stations\` DROP FOREIGN KEY \`FK_b4be42548edc9f6244bb0a78195\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_stations\` DROP FOREIGN KEY \`FK_a5936af38dac4aa90fa6c5f71ae\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_stations\` DROP FOREIGN KEY \`FK_7c11512d13348f2c87a64b3cf80\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_stations\` DROP FOREIGN KEY \`FK_843216da702b05f66e26c858571\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`stations\` DROP FOREIGN KEY \`FK_72f18b596a30267879f2df4f6ba\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`stations\` DROP FOREIGN KEY \`FK_67056f28c5ce34053300e2f0348\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`stations\` DROP FOREIGN KEY \`FK_bda09060505122ca570ed96a882\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_1a5dce25ddd3e35cf448c0ff701\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_6d486ac731936063433530cb091\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_1261a9fe7284cc1a6e5f8fd5d2c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_6acd01f1b66adfe979c54d858b7\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_ba4d7dad0311698a27e69d22f3b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_entity\` DROP FOREIGN KEY \`FK_65ea61524056c08f748367d1b0e\`
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
            ALTER TABLE \`registry_projects\` DROP FOREIGN KEY \`FK_6a9fc1b5ea9c842309b11308fd6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_secrets\` DROP FOREIGN KEY \`FK_2c326a0ff4b5d126f14203cf3b0\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_secrets\` DROP FOREIGN KEY \`FK_c584286beb5ef2c823312479b4f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_files\` DROP FOREIGN KEY \`FK_5601df3f6a788e9525b433c2f2a\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_files\` DROP FOREIGN KEY \`FK_b94260d8f5103a13faecb4565bd\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`train_files\` DROP FOREIGN KEY \`FK_aef21ee15758fca64be4e7caed4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposals\` DROP FOREIGN KEY \`FK_939e43116b2cd9d5d9476bccfe6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposals\` DROP FOREIGN KEY \`FK_14c5aece4591591d2c3cb8a257d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`proposals\` DROP FOREIGN KEY \`FK_246a5b565d0976b97af33c6e4da\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_refresh_tokens\` DROP FOREIGN KEY \`FK_c1f59fdabbcf5dfd74d6af7f400\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_refresh_tokens\` DROP FOREIGN KEY \`FK_3c95cc8e54e69c3acc2b87bc420\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_refresh_tokens\` DROP FOREIGN KEY \`FK_8f611e7ff67a2b013c909f60d52\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_provider_roles\` DROP FOREIGN KEY \`FK_bbfdff6678f0b3507fef481bc26\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_provider_roles\` DROP FOREIGN KEY \`FK_9c47ab7df9dc7300b6bca9220d0\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_provider_roles\` DROP FOREIGN KEY \`FK_c89543ffc106639245a4a2b99c8\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_provider_roles\` DROP FOREIGN KEY \`FK_31ba55948469a1d19cd584a03b7\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_provider_accounts\` DROP FOREIGN KEY \`FK_e284bd0fbef34997a9f035dd741\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_provider_accounts\` DROP FOREIGN KEY \`FK_e18e50974a61970a519ea6a171f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_oauth2_providers\` DROP FOREIGN KEY \`FK_07596e87b9baa3122942fc2e0e9\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_access_tokens\` DROP FOREIGN KEY \`FK_44a975dcfe57d213c19245e77be\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_access_tokens\` DROP FOREIGN KEY \`FK_c40e2f3450b458e935784904fc6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_access_tokens\` DROP FOREIGN KEY \`FK_83d6c9916b02fe7315afb1bcf66\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_access_tokens\` DROP FOREIGN KEY \`FK_0f843d99462f485cf847db9b8cf\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_clients\` DROP FOREIGN KEY \`FK_9c9f985a5cfc1ff52a04c05e5d5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_permissions\` DROP FOREIGN KEY \`FK_b29fe901137f6944ecaf98fcb5a\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_permissions\` DROP FOREIGN KEY \`FK_d52ab826ee04e008624df74cdc8\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_permissions\` DROP FOREIGN KEY \`FK_5af2884572a617e2532410f8221\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_roles\` DROP FOREIGN KEY \`FK_21994ec834c710276cce38c779d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_roles\` DROP FOREIGN KEY \`FK_a4904e9c921294c80f75a0c3e02\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_roles\` DROP FOREIGN KEY \`FK_28146c7babddcad18116dabfa9e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robot_roles\` DROP FOREIGN KEY \`FK_2256b04cbdb1e16e5144e14750b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robots\` DROP FOREIGN KEY \`FK_9c99802f3f360718344180c3f68\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_robots\` DROP FOREIGN KEY \`FK_b6d73e3026e15c0af6c41ef8139\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_permissions\` DROP FOREIGN KEY \`FK_cf962d70634dedf7812fc28282a\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_permissions\` DROP FOREIGN KEY \`FK_5bf6d1affe0575299c44bc58c06\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_permissions\` DROP FOREIGN KEY \`FK_c1d4523b08aa27f07dff798f8d6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_roles\` DROP FOREIGN KEY \`FK_6161ccebf3af1c475758651de49\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_roles\` DROP FOREIGN KEY \`FK_a3a59104c9c9f2a2458972bc96d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_roles\` DROP FOREIGN KEY \`FK_77fe9d38c984c640fc155503c4f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_roles\` DROP FOREIGN KEY \`FK_866cd5c92b05353aab240bdc10a\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_role_permissions\` DROP FOREIGN KEY \`FK_4bbe0c540b241ca21e4bd1d8d12\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_role_permissions\` DROP FOREIGN KEY \`FK_3d29528c774bc47404659fad030\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_role_permissions\` DROP FOREIGN KEY \`FK_3a6789765734cf5f3f555f2098f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_roles\` DROP FOREIGN KEY \`FK_063e4bd5b708c304b51b7ee7743\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_role_attributes\` DROP FOREIGN KEY \`FK_cd014be6be330f64b8405d0c72a\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_role_attributes\` DROP FOREIGN KEY \`FK_2ba00548c512fffe2e5bf4bb3ff\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_users\` DROP FOREIGN KEY \`FK_1d5fcbfcbba74381ca8a58a3f17\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_attributes\` DROP FOREIGN KEY \`FK_f50fe4004312e972a547c0e945e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_user_attributes\` DROP FOREIGN KEY \`FK_9a84db5a27d34b31644b54d9106\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_10373be8b66bfc806d714e17d2\` ON \`proposal_stations\`
        `);
        await queryRunner.query(`
            DROP TABLE \`proposal_stations\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_fcd0ee59b74408554a14729dcf\` ON \`master_image_groups\`
        `);
        await queryRunner.query(`
            DROP TABLE \`master_image_groups\`
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
            DROP INDEX \`station_external_name_index\` ON \`stations\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_d800eab3efc6a62945ef4fb3a1\` ON \`stations\`
        `);
        await queryRunner.query(`
            DROP TABLE \`stations\`
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
            DROP INDEX \`registry_project_external_name_registry_index\` ON \`registry_projects\`
        `);
        await queryRunner.query(`
            DROP INDEX \`registry_project_external_id_registry_index\` ON \`registry_projects\`
        `);
        await queryRunner.query(`
            DROP TABLE \`registry_projects\`
        `);
        await queryRunner.query(`
            DROP TABLE \`registries\`
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
            DROP TABLE \`proposals\`
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
        await queryRunner.query(`
            DROP TABLE \`auth_refresh_tokens\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_039f19cbf8eadd18be864fe0c6\` ON \`auth_oauth2_provider_roles\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_17c48da30a878499a38ac7e47c\` ON \`auth_oauth2_provider_roles\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_oauth2_provider_roles\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_54525c92a39b98d1b0b03ad708\` ON \`auth_oauth2_provider_accounts\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_oauth2_provider_accounts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_4dbdee0f1355d411972939967d\` ON \`auth_oauth2_providers\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_oauth2_providers\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_access_tokens\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_clients\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_0c2284272043ed8aba6689306b\` ON \`auth_robot_permissions\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_robot_permissions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_515b3dc84ba9bec42bd0e92cbd\` ON \`auth_robot_roles\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_robot_roles\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_f32b0b8138a40ced608c7cfc3e\` ON \`auth_robots\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_robots\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_e1a21fc2e6ac12fa29b02c4382\` ON \`auth_user_permissions\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_user_permissions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_e1aaaa657b3c0615f6b4a6e657\` ON \`auth_user_roles\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_user_roles\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_40c0ee0929b20575df125e8d14\` ON \`auth_role_permissions\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_role_permissions\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_permissions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_6e74f330e34555ae90068b0392\` ON \`auth_roles\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_roles\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_41888f98e345dc95d98066c872\` ON \`auth_role_attributes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_role_attributes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_2d54113aa2edfc3955abcf524a\` ON \`auth_users\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_users\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_6e9c808870bd74d6806b6f7641\` ON \`auth_user_attributes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_user_attributes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_9b95dc8c08d8b11a80a6798a64\` ON \`auth_realms\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_realms\`
        `);
    }
}
