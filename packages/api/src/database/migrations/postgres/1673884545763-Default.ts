import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1673884545763 implements MigrationInterface {
    name = 'Default1673884545763';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "auth_realms" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(128) NOT NULL,
                "description" text,
                "drop_able" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_9b95dc8c08d8b11a80a6798a640" UNIQUE ("name"),
                CONSTRAINT "PK_9eee628978e64d0902158e497ca" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_keys" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" character varying(64),
                "priority" integer NOT NULL DEFAULT '0',
                "signature_algorithm" character varying(64),
                "decryption_key" character varying(4096),
                "encryption_key" character varying(4096),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "realm_id" uuid,
                CONSTRAINT "PK_48471fccbf04aa02a191b3aa3a2" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_fdc78f76d9316352bddfed9165" ON "auth_keys" ("type")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5921107054192639a79fb274b9" ON "auth_keys" ("realm_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e38d9d6e8be3d1d6e684b60342" ON "auth_keys" ("priority", "realm_id", "type")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(128) NOT NULL,
                "name_locked" boolean NOT NULL DEFAULT true,
                "first_name" character varying(128),
                "last_name" character varying(128),
                "display_name" character varying(128) NOT NULL,
                "email" character varying(256),
                "password" character varying(512),
                "avatar" character varying(255),
                "cover" character varying(255),
                "reset_hash" character varying(256),
                "reset_at" character varying(28),
                "reset_expires" character varying(28),
                "status" character varying(256),
                "status_message" character varying(256),
                "active" boolean NOT NULL DEFAULT true,
                "activate_hash" character varying(256),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "realm_id" uuid NOT NULL,
                CONSTRAINT "UQ_7e0d8fa52a9921d445798c2bb7e" UNIQUE ("name", "realm_id"),
                CONSTRAINT "PK_c88cc8077366b470dafc2917366" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2d54113aa2edfc3955abcf524a" ON "auth_users" ("name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_13d8b49e55a8b06bee6bbc828f" ON "auth_users" ("email")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1d5fcbfcbba74381ca8a58a3f1" ON "auth_users" ("realm_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(64) NOT NULL,
                "target" character varying(16),
                "description" text,
                "realm_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_dce62a3739791bb4fb2fb5c137b" UNIQUE ("name", "realm_id"),
                CONSTRAINT "PK_fa9e7a265809eafa9e1f47122e2" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_063e4bd5b708c304b51b7ee774" ON "auth_roles" ("realm_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(128) NOT NULL,
                "built_in" boolean NOT NULL DEFAULT false,
                "description" text,
                "target" character varying(16),
                "realm_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_40a392cb2ddf6b12f841d06a82e" UNIQUE ("name"),
                CONSTRAINT "PK_9f1634df753682faaf3d2bca55b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9356935453c5e442d375531ee5" ON "auth_permissions" ("realm_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_role_permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "power" integer NOT NULL DEFAULT '999',
                "condition" text,
                "fields" text,
                "negation" boolean NOT NULL DEFAULT false,
                "target" character varying(16),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "role_id" uuid NOT NULL,
                "role_realm_id" uuid,
                "permission_id" uuid NOT NULL,
                "permission_realm_id" uuid,
                CONSTRAINT "PK_b98ae76361a649bdaff08676b44" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_40c0ee0929b20575df125e8d14" ON "auth_role_permissions" ("permission_id", "role_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_user_roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "role_id" uuid NOT NULL,
                "role_realm_id" uuid,
                "user_id" uuid NOT NULL,
                "user_realm_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_c959817346a5a9cab0682551302" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_e1aaaa657b3c0615f6b4a6e657" ON "auth_user_roles" ("role_id", "user_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_user_permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "power" integer NOT NULL DEFAULT '999',
                "condition" text,
                "fields" text,
                "negation" boolean NOT NULL DEFAULT false,
                "target" character varying(16),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "user_id" uuid NOT NULL,
                "user_realm_id" uuid,
                "permission_id" uuid NOT NULL,
                "permission_realm_id" uuid,
                CONSTRAINT "PK_9f4e91fe9d13e94b0354ed793d7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_e1a21fc2e6ac12fa29b02c4382" ON "auth_user_permissions" ("permission_id", "user_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_user_attributes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "value" text,
                "realm_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_b748c46e233d86287b63b49d09f" UNIQUE ("name", "user_id"),
                CONSTRAINT "PK_a8645a8c813e9a3b90544eea388" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_robots" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "secret" character varying(256) NOT NULL,
                "name" character varying(128) NOT NULL,
                "description" text,
                "active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "user_id" uuid,
                "realm_id" uuid NOT NULL,
                CONSTRAINT "UQ_f89cc2abf1d7e284a7d6cd59c12" UNIQUE ("name", "realm_id"),
                CONSTRAINT "PK_0417c432636b2b07e36aedd9804" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9c99802f3f360718344180c3f6" ON "auth_robots" ("realm_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_robot_roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "role_id" uuid NOT NULL,
                "role_realm_id" uuid,
                "robot_id" character varying NOT NULL,
                "robot_realm_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "client_id" uuid,
                CONSTRAINT "PK_6d175a60a9ac83747b28fa8bc6f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_515b3dc84ba9bec42bd0e92cbd" ON "auth_robot_roles" ("role_id", "robot_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_robot_permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "power" integer NOT NULL DEFAULT '999',
                "condition" text,
                "fields" text,
                "negation" boolean NOT NULL DEFAULT false,
                "target" character varying(16),
                "robot_id" uuid NOT NULL,
                "robot_realm_id" uuid,
                "permission_id" uuid NOT NULL,
                "permission_realm_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_df48d512c182954136955472327" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_0c2284272043ed8aba6689306b" ON "auth_robot_permissions" ("permission_id", "robot_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_clients" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(256) NOT NULL,
                "description" text,
                "secret" character varying(256),
                "redirect_uri" text,
                "grant_types" character varying(512),
                "scope" character varying(512),
                "base_url" character varying(2000),
                "root_url" character varying(2000),
                "is_confidential" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "realm_id" uuid,
                "user_id" uuid,
                CONSTRAINT "UQ_6018b722f28f1cc6fdac450e611" UNIQUE ("name", "realm_id"),
                CONSTRAINT "PK_78cdf6da019ce56abcfbbe45e47" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_authorization_codes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "content" character varying(4096) NOT NULL,
                "expires" character varying(28) NOT NULL,
                "scope" character varying(512),
                "redirect_uri" character varying(2000),
                "id_token" character varying(1000),
                "client_id" uuid,
                "user_id" uuid,
                "robot_id" uuid,
                "realm_id" uuid NOT NULL,
                CONSTRAINT "PK_c2ecb6968a63a751bd6fd2e2b6b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_scopes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "built_in" boolean NOT NULL DEFAULT false,
                "name" character varying(128) NOT NULL,
                "description" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "realm_id" uuid,
                CONSTRAINT "UQ_b14fab23784a81c282abef41fae" UNIQUE ("name", "realm_id"),
                CONSTRAINT "PK_a3f8e9d06f8d413a18b7b212fde" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_client_scopes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "default" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "client_id" uuid NOT NULL,
                "scope_id" uuid NOT NULL,
                CONSTRAINT "UQ_ddec4250b145536333f137ff963" UNIQUE ("client_id", "scope_id"),
                CONSTRAINT "PK_1594b57c88084fb019807642524" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_identity_providers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "slug" character varying(36) NOT NULL,
                "name" character varying(128) NOT NULL,
                "protocol" character varying(64) NOT NULL,
                "protocol_config" character varying(64),
                "enabled" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "realm_id" uuid NOT NULL,
                CONSTRAINT "UQ_3752f24587d0405c13f5a790da7" UNIQUE ("slug", "realm_id"),
                CONSTRAINT "PK_f5ee520f6fd8625a6d2223a16d6" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_identity_provider_attributes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "value" text,
                "provider_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_994a26636cc20da801d5ef4ee40" UNIQUE ("name", "provider_id"),
                CONSTRAINT "PK_c701a8fc87e4f8d7af3bf6a25c7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_identity_provider_accounts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "access_token" text,
                "refresh_token" text,
                "provider_user_id" character varying(256) NOT NULL,
                "provider_user_name" character varying(256),
                "provider_user_email" character varying(512),
                "expires_in" integer,
                "expires_at" character varying(28),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "user_id" uuid NOT NULL,
                "provider_id" uuid NOT NULL,
                CONSTRAINT "PK_d43a08fc9f6efcb21e9c39a8607" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_96a230c697b83505e073713507" ON "auth_identity_provider_accounts" ("provider_id", "user_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_identity_provider_roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "external_id" character varying(36) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "role_id" uuid NOT NULL,
                "role_realm_id" uuid,
                "provider_id" uuid NOT NULL,
                "provider_realm_id" uuid,
                CONSTRAINT "PK_345f74231cf39250a3e572b84a7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_42df2e30eee05e54c74bced78b" ON "auth_identity_provider_roles" ("provider_id", "external_id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_fadb9ce4df580cc42e78b74b2f" ON "auth_identity_provider_roles" ("provider_id", "role_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_refresh_tokens" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "expires" character varying(28) NOT NULL,
                "scope" character varying(512),
                "access_token" uuid,
                "client_id" uuid,
                "user_id" uuid,
                "robot_id" uuid,
                "realm_id" uuid NOT NULL,
                CONSTRAINT "PK_df6893d2063a4ea7bbf1eda31e5" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_role_attributes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "value" text,
                "realm_id" uuid,
                "role_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_aabe997ae70f617cb5479ed8d87" UNIQUE ("name", "role_id"),
                CONSTRAINT "PK_4ca2632652ed52dba0d42c59a7e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "master_images" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "path" character varying,
                "virtual_path" character varying(256) NOT NULL,
                "group_virtual_path" character varying(256) NOT NULL,
                "name" character varying NOT NULL,
                "command" text,
                "command_arguments" json,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_1dab763055a9a2015bfdc496cc1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_7c779b370b32ebaed6b9cc7576" ON "master_images" ("virtual_path")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f5d09cafff06c3a976ebff5f2a" ON "master_images" ("group_virtual_path")
        `);
        await queryRunner.query(`
            CREATE TABLE "proposals" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(256) NOT NULL,
                "requested_data" character varying NOT NULL,
                "risk" character varying(64) NOT NULL DEFAULT 'low',
                "risk_comment" character varying(4096) NOT NULL,
                "trains" integer NOT NULL DEFAULT '0',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "realm_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "master_image_id" uuid,
                CONSTRAINT "PK_db524c8db8e126a38a2f16d8cac" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "train_files" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(256) NOT NULL,
                "hash" character varying(4096) NOT NULL,
                "directory" character varying,
                "size" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "user_id" uuid NOT NULL,
                "train_id" uuid NOT NULL,
                "realm_id" uuid,
                CONSTRAINT "PK_e04e9d45b713e508af296643db0" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user_secrets" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "key" character varying(128) NOT NULL,
                "type" character varying(64) NOT NULL,
                "content" text,
                "user_id" uuid NOT NULL,
                "realm_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "keyUserId" UNIQUE ("key", "user_id"),
                CONSTRAINT "PK_215249fa12819f0ac12e21e51fe" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1fb79b7f53ab551f3ce713bad9" ON "user_secrets" ("type")
        `);
        await queryRunner.query(`
            CREATE TABLE "registries" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(128) NOT NULL,
                "host" character varying(512) NOT NULL,
                "ecosystem" character varying(64) NOT NULL DEFAULT 'tue',
                "account_name" character varying(256),
                "account_secret" character varying(256),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_414eba74fdd10096bfda34f495f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "registry_projects" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(128) NOT NULL,
                "ecosystem" character varying(64) NOT NULL DEFAULT 'tue',
                "type" character varying(64) DEFAULT 'default',
                "public" boolean NOT NULL DEFAULT true,
                "external_name" character varying(64) NOT NULL,
                "external_id" character varying(64),
                "account_id" character varying(64),
                "account_name" character varying(256),
                "account_secret" character varying(256),
                "webhook_name" character varying(128),
                "webhook_exists" boolean NOT NULL DEFAULT false,
                "registry_id" uuid NOT NULL,
                "realm_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_d64dd084b79703879cc66b3e9c2" UNIQUE ("external_id", "registry_id"),
                CONSTRAINT "UQ_1fa5e8b7ffc0786daf0adb941bd" UNIQUE ("external_name", "registry_id"),
                CONSTRAINT "UQ_bd7100277fb5331625c2b474ead" UNIQUE ("name", "registry_id"),
                CONSTRAINT "PK_810dbb77e7a7d56fb70934d7c0a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "train_entity" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" character varying(64) NOT NULL DEFAULT 'analyse',
                "name" character varying(128),
                "query" text,
                "hash" text,
                "hash_signed" text,
                "session_id" character varying,
                "entrypoint_file_id" uuid,
                "stations" integer NOT NULL DEFAULT '0',
                "configuration_status" character varying(64),
                "build_status" character varying(64),
                "run_status" character varying(64),
                "run_station_id" uuid,
                "run_station_index" integer,
                "result_status" character varying(64),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "incoming_registry_project_id" uuid,
                "outgoing_registry_project_id" uuid,
                "registry_id" uuid,
                "realm_id" uuid NOT NULL,
                "user_rsa_secret_id" uuid,
                "user_paillier_secret_id" uuid,
                "user_id" uuid,
                "proposal_id" uuid NOT NULL,
                "master_image_id" uuid,
                CONSTRAINT "REL_c3404c5af13c46bf0ce572a49b" UNIQUE ("entrypoint_file_id"),
                CONSTRAINT "PK_70c787d4fe6a1520a1ddf97fc57" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ffeb48386b410cd0238b5758f5" ON "train_entity" ("type")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ff1003328676db596bdb563387" ON "train_entity" ("name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c18eae3bae26a1c4ea8da34d9d" ON "train_entity" ("configuration_status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_fdf1f1d751c66a8d160c650175" ON "train_entity" ("build_status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_474056e5a06f82e96522d6eac2" ON "train_entity" ("run_status")
        `);
        await queryRunner.query(`
            CREATE TABLE "train_logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "component" character varying(64),
                "command" character varying(64),
                "event" character varying(64),
                "step" character varying(64),
                "error" boolean NOT NULL DEFAULT false,
                "error_code" character varying(64),
                "status" character varying(64),
                "status_message" text,
                "meta" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "train_id" uuid NOT NULL,
                "realm_id" uuid NOT NULL,
                CONSTRAINT "PK_7be874fe48da393505d96e656c7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_10263b5b69c6cf8fd525f32e1a" ON "train_logs" ("component")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_82f08533c80a89ad9d5fc13a5b" ON "train_logs" ("command")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5a9c144ceca9d04d7b95c1a9ff" ON "train_logs" ("step")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1f17a2029a3b579c51824b943b" ON "train_logs" ("status")
        `);
        await queryRunner.query(`
            CREATE TABLE "stations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "external_name" character varying(64),
                "name" character varying(128) NOT NULL,
                "public_key" text,
                "email" character varying(256),
                "ecosystem" character varying(32) DEFAULT 'tue',
                "hidden" boolean NOT NULL DEFAULT false,
                "registry_id" uuid,
                "registry_project_id" uuid,
                "realm_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_d800eab3efc6a62945ef4fb3a11" UNIQUE ("name", "realm_id"),
                CONSTRAINT "station_external_name_index" UNIQUE ("external_name"),
                CONSTRAINT "PK_f047974bd453c85b08bab349367" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "train_stations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "approval_status" character varying,
                "run_status" character varying,
                "comment" text,
                "index" integer,
                "artifact_tag" character varying(32),
                "artifact_digest" character varying(512),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "train_id" uuid NOT NULL,
                "train_realm_id" uuid NOT NULL,
                "station_id" uuid NOT NULL,
                "station_realm_id" uuid NOT NULL,
                CONSTRAINT "UQ_a8875fc50368aac318fd849ec14" UNIQUE ("station_id", "train_id"),
                CONSTRAINT "UQ_f005c437d50a2ee578576026aac" UNIQUE ("index", "train_id"),
                CONSTRAINT "PK_314ea500db4038058960c0bf279" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "master_image_groups" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(128) NOT NULL,
                "path" character varying(512) NOT NULL,
                "virtual_path" character varying(256) NOT NULL,
                "command" text,
                "command_arguments" json,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_33be9aae7c26b7cf7bad5f01fdd" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_fcd0ee59b74408554a14729dcf" ON "master_image_groups" ("virtual_path")
        `);
        await queryRunner.query(`
            CREATE TABLE "proposal_stations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "approval_status" character varying,
                "comment" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "proposal_id" uuid NOT NULL,
                "proposal_realm_id" uuid NOT NULL,
                "station_id" uuid NOT NULL,
                "station_realm_id" uuid NOT NULL,
                CONSTRAINT "UQ_10373be8b66bfc806d714e17d2c" UNIQUE ("proposal_id", "station_id"),
                CONSTRAINT "PK_bac64141b428ff95feb8aca9a64" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_keys"
            ADD CONSTRAINT "FK_5921107054192639a79fb274b91" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_users"
            ADD CONSTRAINT "FK_1d5fcbfcbba74381ca8a58a3f17" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_roles"
            ADD CONSTRAINT "FK_063e4bd5b708c304b51b7ee7743" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_permissions"
            ADD CONSTRAINT "FK_9356935453c5e442d375531ee52" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_role_permissions"
            ADD CONSTRAINT "FK_3a6789765734cf5f3f555f2098f" FOREIGN KEY ("role_id") REFERENCES "auth_roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_role_permissions"
            ADD CONSTRAINT "FK_3d29528c774bc47404659fad030" FOREIGN KEY ("role_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_role_permissions"
            ADD CONSTRAINT "FK_4bbe0c540b241ca21e4bd1d8d12" FOREIGN KEY ("permission_id") REFERENCES "auth_permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_role_permissions"
            ADD CONSTRAINT "FK_f9ab8919ff5d5993816f6881879" FOREIGN KEY ("permission_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_roles"
            ADD CONSTRAINT "FK_866cd5c92b05353aab240bdc10a" FOREIGN KEY ("role_id") REFERENCES "auth_roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_roles"
            ADD CONSTRAINT "FK_77fe9d38c984c640fc155503c4f" FOREIGN KEY ("role_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_roles"
            ADD CONSTRAINT "FK_a3a59104c9c9f2a2458972bc96d" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_roles"
            ADD CONSTRAINT "FK_6161ccebf3af1c475758651de49" FOREIGN KEY ("user_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_permissions"
            ADD CONSTRAINT "FK_c1d4523b08aa27f07dff798f8d6" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_permissions"
            ADD CONSTRAINT "FK_5bf6d1affe0575299c44bc58c06" FOREIGN KEY ("user_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_permissions"
            ADD CONSTRAINT "FK_cf962d70634dedf7812fc28282a" FOREIGN KEY ("permission_id") REFERENCES "auth_permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_permissions"
            ADD CONSTRAINT "FK_e2de70574303693fea386cc0edd" FOREIGN KEY ("permission_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_attributes"
            ADD CONSTRAINT "FK_9a84db5a27d34b31644b54d9106" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_attributes"
            ADD CONSTRAINT "FK_f50fe4004312e972a547c0e945e" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robots"
            ADD CONSTRAINT "FK_b6d73e3026e15c0af6c41ef8139" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robots"
            ADD CONSTRAINT "FK_9c99802f3f360718344180c3f68" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_roles"
            ADD CONSTRAINT "FK_2256b04cbdb1e16e5144e14750b" FOREIGN KEY ("role_id") REFERENCES "auth_roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_roles"
            ADD CONSTRAINT "FK_28146c7babddcad18116dabfa9e" FOREIGN KEY ("role_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_roles"
            ADD CONSTRAINT "FK_a4904e9c921294c80f75a0c3e02" FOREIGN KEY ("client_id") REFERENCES "auth_robots"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_roles"
            ADD CONSTRAINT "FK_21994ec834c710276cce38c779d" FOREIGN KEY ("robot_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_permissions"
            ADD CONSTRAINT "FK_5af2884572a617e2532410f8221" FOREIGN KEY ("robot_id") REFERENCES "auth_robots"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_permissions"
            ADD CONSTRAINT "FK_d52ab826ee04e008624df74cdc8" FOREIGN KEY ("robot_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_permissions"
            ADD CONSTRAINT "FK_b29fe901137f6944ecaf98fcb5a" FOREIGN KEY ("permission_id") REFERENCES "auth_permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_permissions"
            ADD CONSTRAINT "FK_1cacb8af1791a5303d30cbf8590" FOREIGN KEY ("permission_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_clients"
            ADD CONSTRAINT "FK_b628ffa1b2f5415598cfb1a72af" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_clients"
            ADD CONSTRAINT "FK_9c9f985a5cfc1ff52a04c05e5d5" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_authorization_codes"
            ADD CONSTRAINT "FK_ff6e597e9dd296da510efc06d28" FOREIGN KEY ("client_id") REFERENCES "auth_clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_authorization_codes"
            ADD CONSTRAINT "FK_5119ffb8f6b8ba853e52be2e417" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_authorization_codes"
            ADD CONSTRAINT "FK_32619f36922f433e27affc169e4" FOREIGN KEY ("robot_id") REFERENCES "auth_robots"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_authorization_codes"
            ADD CONSTRAINT "FK_343b25488aef1b87f4771f8c7eb" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_scopes"
            ADD CONSTRAINT "FK_69e83c8e7e11a247a0809eb3327" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_client_scopes"
            ADD CONSTRAINT "FK_6331374fa74645dae2d52547081" FOREIGN KEY ("client_id") REFERENCES "auth_clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_client_scopes"
            ADD CONSTRAINT "FK_471f3da9df80f92c382a586e9ca" FOREIGN KEY ("scope_id") REFERENCES "auth_scopes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_providers"
            ADD CONSTRAINT "FK_00fd737c365d688f9edd0c73eca" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_attributes"
            ADD CONSTRAINT "FK_5ac40c5ce92142639df65a33e53" FOREIGN KEY ("provider_id") REFERENCES "auth_identity_providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_accounts"
            ADD CONSTRAINT "FK_b07582d2705a04c2e868e6c3742" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_accounts"
            ADD CONSTRAINT "FK_a82bbdf79b8accbfe71326dce00" FOREIGN KEY ("provider_id") REFERENCES "auth_identity_providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_roles"
            ADD CONSTRAINT "FK_f32f792ca1aeacea0507ef80a11" FOREIGN KEY ("role_id") REFERENCES "auth_roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_roles"
            ADD CONSTRAINT "FK_2c3139bd232ffde35b71d43018e" FOREIGN KEY ("role_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_roles"
            ADD CONSTRAINT "FK_52a568200844cde16722b9bb95e" FOREIGN KEY ("provider_id") REFERENCES "auth_identity_providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_roles"
            ADD CONSTRAINT "FK_d49fb54b140869696a5a14285c7" FOREIGN KEY ("provider_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_refresh_tokens"
            ADD CONSTRAINT "FK_8f611e7ff67a2b013c909f60d52" FOREIGN KEY ("client_id") REFERENCES "auth_clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_refresh_tokens"
            ADD CONSTRAINT "FK_f795ad14f31838e3ddc663ee150" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_refresh_tokens"
            ADD CONSTRAINT "FK_6be38b6dbd4ce86ca3d17494ca9" FOREIGN KEY ("robot_id") REFERENCES "auth_robots"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_refresh_tokens"
            ADD CONSTRAINT "FK_c1f59fdabbcf5dfd74d6af7f400" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_role_attributes"
            ADD CONSTRAINT "FK_2ba00548c512fffe2e5bf4bb3ff" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_role_attributes"
            ADD CONSTRAINT "FK_cd014be6be330f64b8405d0c72a" FOREIGN KEY ("role_id") REFERENCES "auth_roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposals"
            ADD CONSTRAINT "FK_246a5b565d0976b97af33c6e4da" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposals"
            ADD CONSTRAINT "FK_14c5aece4591591d2c3cb8a257d" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposals"
            ADD CONSTRAINT "FK_939e43116b2cd9d5d9476bccfe6" FOREIGN KEY ("master_image_id") REFERENCES "master_images"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_files"
            ADD CONSTRAINT "FK_aef21ee15758fca64be4e7caed4" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_files"
            ADD CONSTRAINT "FK_b94260d8f5103a13faecb4565bd" FOREIGN KEY ("train_id") REFERENCES "train_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_files"
            ADD CONSTRAINT "FK_5601df3f6a788e9525b433c2f2a" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_secrets"
            ADD CONSTRAINT "FK_c584286beb5ef2c823312479b4f" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_secrets"
            ADD CONSTRAINT "FK_2c326a0ff4b5d126f14203cf3b0" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "registry_projects"
            ADD CONSTRAINT "FK_6a9fc1b5ea9c842309b11308fd6" FOREIGN KEY ("registry_id") REFERENCES "registries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "registry_projects"
            ADD CONSTRAINT "FK_0fadd5dc84495e2be1d98f22628" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity"
            ADD CONSTRAINT "FK_c3404c5af13c46bf0ce572a49b2" FOREIGN KEY ("entrypoint_file_id") REFERENCES "train_files"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity"
            ADD CONSTRAINT "FK_1b7054826d95198cbdf7751e7c4" FOREIGN KEY ("incoming_registry_project_id") REFERENCES "registry_projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity"
            ADD CONSTRAINT "FK_53a11f94b27b25b78fd27e63723" FOREIGN KEY ("outgoing_registry_project_id") REFERENCES "registry_projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity"
            ADD CONSTRAINT "FK_b453df94ba37e4d44ad9d6e1977" FOREIGN KEY ("registry_id") REFERENCES "registries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity"
            ADD CONSTRAINT "FK_65ea61524056c08f748367d1b0e" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity"
            ADD CONSTRAINT "FK_ba4d7dad0311698a27e69d22f3b" FOREIGN KEY ("user_rsa_secret_id") REFERENCES "user_secrets"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity"
            ADD CONSTRAINT "FK_6acd01f1b66adfe979c54d858b7" FOREIGN KEY ("user_paillier_secret_id") REFERENCES "user_secrets"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity"
            ADD CONSTRAINT "FK_1261a9fe7284cc1a6e5f8fd5d2c" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity"
            ADD CONSTRAINT "FK_6d486ac731936063433530cb091" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity"
            ADD CONSTRAINT "FK_1a5dce25ddd3e35cf448c0ff701" FOREIGN KEY ("master_image_id") REFERENCES "master_images"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_logs"
            ADD CONSTRAINT "FK_a5c233a9248190263cfacdf07fb" FOREIGN KEY ("train_id") REFERENCES "train_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_logs"
            ADD CONSTRAINT "FK_531bffd9804d04e892959f7799e" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "stations"
            ADD CONSTRAINT "FK_bda09060505122ca570ed96a882" FOREIGN KEY ("registry_id") REFERENCES "registries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "stations"
            ADD CONSTRAINT "FK_67056f28c5ce34053300e2f0348" FOREIGN KEY ("registry_project_id") REFERENCES "registry_projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "stations"
            ADD CONSTRAINT "FK_72f18b596a30267879f2df4f6ba" FOREIGN KEY ("realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_stations"
            ADD CONSTRAINT "FK_843216da702b05f66e26c858571" FOREIGN KEY ("train_id") REFERENCES "train_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_stations"
            ADD CONSTRAINT "FK_7c11512d13348f2c87a64b3cf80" FOREIGN KEY ("train_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_stations"
            ADD CONSTRAINT "FK_a5936af38dac4aa90fa6c5f71ae" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_stations"
            ADD CONSTRAINT "FK_b4be42548edc9f6244bb0a78195" FOREIGN KEY ("station_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_stations"
            ADD CONSTRAINT "FK_bc110110c7b13f588a9ebfeecc5" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_stations"
            ADD CONSTRAINT "FK_6e847394c275332e906dcac67c2" FOREIGN KEY ("proposal_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_stations"
            ADD CONSTRAINT "FK_3a2e9992f68c76b8cf8ea80d8f5" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_stations"
            ADD CONSTRAINT "FK_4964bb2770bd4ee1eb019235ffa" FOREIGN KEY ("station_realm_id") REFERENCES "auth_realms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "proposal_stations" DROP CONSTRAINT "FK_4964bb2770bd4ee1eb019235ffa"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_stations" DROP CONSTRAINT "FK_3a2e9992f68c76b8cf8ea80d8f5"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_stations" DROP CONSTRAINT "FK_6e847394c275332e906dcac67c2"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_stations" DROP CONSTRAINT "FK_bc110110c7b13f588a9ebfeecc5"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_stations" DROP CONSTRAINT "FK_b4be42548edc9f6244bb0a78195"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_stations" DROP CONSTRAINT "FK_a5936af38dac4aa90fa6c5f71ae"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_stations" DROP CONSTRAINT "FK_7c11512d13348f2c87a64b3cf80"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_stations" DROP CONSTRAINT "FK_843216da702b05f66e26c858571"
        `);
        await queryRunner.query(`
            ALTER TABLE "stations" DROP CONSTRAINT "FK_72f18b596a30267879f2df4f6ba"
        `);
        await queryRunner.query(`
            ALTER TABLE "stations" DROP CONSTRAINT "FK_67056f28c5ce34053300e2f0348"
        `);
        await queryRunner.query(`
            ALTER TABLE "stations" DROP CONSTRAINT "FK_bda09060505122ca570ed96a882"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_logs" DROP CONSTRAINT "FK_531bffd9804d04e892959f7799e"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_logs" DROP CONSTRAINT "FK_a5c233a9248190263cfacdf07fb"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_1a5dce25ddd3e35cf448c0ff701"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_6d486ac731936063433530cb091"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_1261a9fe7284cc1a6e5f8fd5d2c"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_6acd01f1b66adfe979c54d858b7"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_ba4d7dad0311698a27e69d22f3b"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_65ea61524056c08f748367d1b0e"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_b453df94ba37e4d44ad9d6e1977"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_53a11f94b27b25b78fd27e63723"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_1b7054826d95198cbdf7751e7c4"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_c3404c5af13c46bf0ce572a49b2"
        `);
        await queryRunner.query(`
            ALTER TABLE "registry_projects" DROP CONSTRAINT "FK_0fadd5dc84495e2be1d98f22628"
        `);
        await queryRunner.query(`
            ALTER TABLE "registry_projects" DROP CONSTRAINT "FK_6a9fc1b5ea9c842309b11308fd6"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_secrets" DROP CONSTRAINT "FK_2c326a0ff4b5d126f14203cf3b0"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_secrets" DROP CONSTRAINT "FK_c584286beb5ef2c823312479b4f"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_files" DROP CONSTRAINT "FK_5601df3f6a788e9525b433c2f2a"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_files" DROP CONSTRAINT "FK_b94260d8f5103a13faecb4565bd"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_files" DROP CONSTRAINT "FK_aef21ee15758fca64be4e7caed4"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposals" DROP CONSTRAINT "FK_939e43116b2cd9d5d9476bccfe6"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposals" DROP CONSTRAINT "FK_14c5aece4591591d2c3cb8a257d"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposals" DROP CONSTRAINT "FK_246a5b565d0976b97af33c6e4da"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_role_attributes" DROP CONSTRAINT "FK_cd014be6be330f64b8405d0c72a"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_role_attributes" DROP CONSTRAINT "FK_2ba00548c512fffe2e5bf4bb3ff"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_refresh_tokens" DROP CONSTRAINT "FK_c1f59fdabbcf5dfd74d6af7f400"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_refresh_tokens" DROP CONSTRAINT "FK_6be38b6dbd4ce86ca3d17494ca9"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_refresh_tokens" DROP CONSTRAINT "FK_f795ad14f31838e3ddc663ee150"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_refresh_tokens" DROP CONSTRAINT "FK_8f611e7ff67a2b013c909f60d52"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_roles" DROP CONSTRAINT "FK_d49fb54b140869696a5a14285c7"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_roles" DROP CONSTRAINT "FK_52a568200844cde16722b9bb95e"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_roles" DROP CONSTRAINT "FK_2c3139bd232ffde35b71d43018e"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_roles" DROP CONSTRAINT "FK_f32f792ca1aeacea0507ef80a11"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_accounts" DROP CONSTRAINT "FK_a82bbdf79b8accbfe71326dce00"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_accounts" DROP CONSTRAINT "FK_b07582d2705a04c2e868e6c3742"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_provider_attributes" DROP CONSTRAINT "FK_5ac40c5ce92142639df65a33e53"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_identity_providers" DROP CONSTRAINT "FK_00fd737c365d688f9edd0c73eca"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_client_scopes" DROP CONSTRAINT "FK_471f3da9df80f92c382a586e9ca"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_client_scopes" DROP CONSTRAINT "FK_6331374fa74645dae2d52547081"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_scopes" DROP CONSTRAINT "FK_69e83c8e7e11a247a0809eb3327"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_authorization_codes" DROP CONSTRAINT "FK_343b25488aef1b87f4771f8c7eb"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_authorization_codes" DROP CONSTRAINT "FK_32619f36922f433e27affc169e4"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_authorization_codes" DROP CONSTRAINT "FK_5119ffb8f6b8ba853e52be2e417"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_authorization_codes" DROP CONSTRAINT "FK_ff6e597e9dd296da510efc06d28"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_clients" DROP CONSTRAINT "FK_9c9f985a5cfc1ff52a04c05e5d5"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_clients" DROP CONSTRAINT "FK_b628ffa1b2f5415598cfb1a72af"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_permissions" DROP CONSTRAINT "FK_1cacb8af1791a5303d30cbf8590"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_permissions" DROP CONSTRAINT "FK_b29fe901137f6944ecaf98fcb5a"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_permissions" DROP CONSTRAINT "FK_d52ab826ee04e008624df74cdc8"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_permissions" DROP CONSTRAINT "FK_5af2884572a617e2532410f8221"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_roles" DROP CONSTRAINT "FK_21994ec834c710276cce38c779d"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_roles" DROP CONSTRAINT "FK_a4904e9c921294c80f75a0c3e02"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_roles" DROP CONSTRAINT "FK_28146c7babddcad18116dabfa9e"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robot_roles" DROP CONSTRAINT "FK_2256b04cbdb1e16e5144e14750b"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robots" DROP CONSTRAINT "FK_9c99802f3f360718344180c3f68"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_robots" DROP CONSTRAINT "FK_b6d73e3026e15c0af6c41ef8139"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_attributes" DROP CONSTRAINT "FK_f50fe4004312e972a547c0e945e"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_attributes" DROP CONSTRAINT "FK_9a84db5a27d34b31644b54d9106"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_permissions" DROP CONSTRAINT "FK_e2de70574303693fea386cc0edd"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_permissions" DROP CONSTRAINT "FK_cf962d70634dedf7812fc28282a"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_permissions" DROP CONSTRAINT "FK_5bf6d1affe0575299c44bc58c06"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_permissions" DROP CONSTRAINT "FK_c1d4523b08aa27f07dff798f8d6"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_roles" DROP CONSTRAINT "FK_6161ccebf3af1c475758651de49"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_roles" DROP CONSTRAINT "FK_a3a59104c9c9f2a2458972bc96d"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_roles" DROP CONSTRAINT "FK_77fe9d38c984c640fc155503c4f"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_user_roles" DROP CONSTRAINT "FK_866cd5c92b05353aab240bdc10a"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_role_permissions" DROP CONSTRAINT "FK_f9ab8919ff5d5993816f6881879"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_role_permissions" DROP CONSTRAINT "FK_4bbe0c540b241ca21e4bd1d8d12"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_role_permissions" DROP CONSTRAINT "FK_3d29528c774bc47404659fad030"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_role_permissions" DROP CONSTRAINT "FK_3a6789765734cf5f3f555f2098f"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_permissions" DROP CONSTRAINT "FK_9356935453c5e442d375531ee52"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_roles" DROP CONSTRAINT "FK_063e4bd5b708c304b51b7ee7743"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_users" DROP CONSTRAINT "FK_1d5fcbfcbba74381ca8a58a3f17"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_keys" DROP CONSTRAINT "FK_5921107054192639a79fb274b91"
        `);
        await queryRunner.query(`
            DROP TABLE "proposal_stations"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_fcd0ee59b74408554a14729dcf"
        `);
        await queryRunner.query(`
            DROP TABLE "master_image_groups"
        `);
        await queryRunner.query(`
            DROP TABLE "train_stations"
        `);
        await queryRunner.query(`
            DROP TABLE "stations"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1f17a2029a3b579c51824b943b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5a9c144ceca9d04d7b95c1a9ff"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_82f08533c80a89ad9d5fc13a5b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_10263b5b69c6cf8fd525f32e1a"
        `);
        await queryRunner.query(`
            DROP TABLE "train_logs"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_474056e5a06f82e96522d6eac2"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_fdf1f1d751c66a8d160c650175"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c18eae3bae26a1c4ea8da34d9d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ff1003328676db596bdb563387"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ffeb48386b410cd0238b5758f5"
        `);
        await queryRunner.query(`
            DROP TABLE "train_entity"
        `);
        await queryRunner.query(`
            DROP TABLE "registry_projects"
        `);
        await queryRunner.query(`
            DROP TABLE "registries"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1fb79b7f53ab551f3ce713bad9"
        `);
        await queryRunner.query(`
            DROP TABLE "user_secrets"
        `);
        await queryRunner.query(`
            DROP TABLE "train_files"
        `);
        await queryRunner.query(`
            DROP TABLE "proposals"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f5d09cafff06c3a976ebff5f2a"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7c779b370b32ebaed6b9cc7576"
        `);
        await queryRunner.query(`
            DROP TABLE "master_images"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_role_attributes"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_refresh_tokens"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_fadb9ce4df580cc42e78b74b2f"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_42df2e30eee05e54c74bced78b"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_identity_provider_roles"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_96a230c697b83505e073713507"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_identity_provider_accounts"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_identity_provider_attributes"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_identity_providers"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_client_scopes"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_scopes"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_authorization_codes"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_clients"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_0c2284272043ed8aba6689306b"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_robot_permissions"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_515b3dc84ba9bec42bd0e92cbd"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_robot_roles"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9c99802f3f360718344180c3f6"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_robots"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_user_attributes"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e1a21fc2e6ac12fa29b02c4382"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_user_permissions"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e1aaaa657b3c0615f6b4a6e657"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_user_roles"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_40c0ee0929b20575df125e8d14"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_role_permissions"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9356935453c5e442d375531ee5"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_permissions"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_063e4bd5b708c304b51b7ee774"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_roles"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1d5fcbfcbba74381ca8a58a3f1"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_13d8b49e55a8b06bee6bbc828f"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2d54113aa2edfc3955abcf524a"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_users"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e38d9d6e8be3d1d6e684b60342"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5921107054192639a79fb274b9"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_fdc78f76d9316352bddfed9165"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_keys"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_realms"
        `);
    }
}
