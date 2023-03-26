import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1679651496566 implements MigrationInterface {
    name = 'Default1679651496566';

    public async up(queryRunner: QueryRunner): Promise<void> {
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
                "user_id" uuid,
                "master_image_id" uuid,
                CONSTRAINT "PK_db524c8db8e126a38a2f16d8cac" PRIMARY KEY ("id")
            )
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
            CREATE TABLE "train_files" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(256) NOT NULL,
                "hash" character varying(4096) NOT NULL,
                "directory" character varying,
                "size" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "user_id" uuid NOT NULL,
                "realm_id" uuid NOT NULL,
                "train_id" uuid NOT NULL,
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
            ALTER TABLE "proposals"
            ADD CONSTRAINT "FK_939e43116b2cd9d5d9476bccfe6" FOREIGN KEY ("master_image_id") REFERENCES "master_images"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "registry_projects"
            ADD CONSTRAINT "FK_6a9fc1b5ea9c842309b11308fd6" FOREIGN KEY ("registry_id") REFERENCES "registries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "proposal_stations"
            ADD CONSTRAINT "FK_bc110110c7b13f588a9ebfeecc5" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_stations"
            ADD CONSTRAINT "FK_3a2e9992f68c76b8cf8ea80d8f5" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_files"
            ADD CONSTRAINT "FK_b94260d8f5103a13faecb4565bd" FOREIGN KEY ("train_id") REFERENCES "train_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ADD CONSTRAINT "FK_6d486ac731936063433530cb091" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity"
            ADD CONSTRAINT "FK_1a5dce25ddd3e35cf448c0ff701" FOREIGN KEY ("master_image_id") REFERENCES "master_images"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_stations"
            ADD CONSTRAINT "FK_843216da702b05f66e26c858571" FOREIGN KEY ("train_id") REFERENCES "train_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_stations"
            ADD CONSTRAINT "FK_a5936af38dac4aa90fa6c5f71ae" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "train_logs"
            ADD CONSTRAINT "FK_a5c233a9248190263cfacdf07fb" FOREIGN KEY ("train_id") REFERENCES "train_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "train_logs" DROP CONSTRAINT "FK_a5c233a9248190263cfacdf07fb"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_stations" DROP CONSTRAINT "FK_a5936af38dac4aa90fa6c5f71ae"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_stations" DROP CONSTRAINT "FK_843216da702b05f66e26c858571"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_1a5dce25ddd3e35cf448c0ff701"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_6d486ac731936063433530cb091"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_6acd01f1b66adfe979c54d858b7"
        `);
        await queryRunner.query(`
            ALTER TABLE "train_entity" DROP CONSTRAINT "FK_ba4d7dad0311698a27e69d22f3b"
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
            ALTER TABLE "train_files" DROP CONSTRAINT "FK_b94260d8f5103a13faecb4565bd"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_stations" DROP CONSTRAINT "FK_3a2e9992f68c76b8cf8ea80d8f5"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_stations" DROP CONSTRAINT "FK_bc110110c7b13f588a9ebfeecc5"
        `);
        await queryRunner.query(`
            ALTER TABLE "stations" DROP CONSTRAINT "FK_67056f28c5ce34053300e2f0348"
        `);
        await queryRunner.query(`
            ALTER TABLE "stations" DROP CONSTRAINT "FK_bda09060505122ca570ed96a882"
        `);
        await queryRunner.query(`
            ALTER TABLE "registry_projects" DROP CONSTRAINT "FK_6a9fc1b5ea9c842309b11308fd6"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposals" DROP CONSTRAINT "FK_939e43116b2cd9d5d9476bccfe6"
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
            DROP TABLE "train_stations"
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
            DROP INDEX "public"."IDX_1fb79b7f53ab551f3ce713bad9"
        `);
        await queryRunner.query(`
            DROP TABLE "user_secrets"
        `);
        await queryRunner.query(`
            DROP TABLE "train_files"
        `);
        await queryRunner.query(`
            DROP TABLE "proposal_stations"
        `);
        await queryRunner.query(`
            DROP TABLE "stations"
        `);
        await queryRunner.query(`
            DROP TABLE "registry_projects"
        `);
        await queryRunner.query(`
            DROP TABLE "registries"
        `);
        await queryRunner.query(`
            DROP TABLE "proposals"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_fcd0ee59b74408554a14729dcf"
        `);
        await queryRunner.query(`
            DROP TABLE "master_image_groups"
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
    }
}
