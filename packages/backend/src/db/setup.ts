import {requireFromEnv} from '../env';
import {createConnection as createMysqlConnection, MysqlError} from 'mysql';
import {createConnection as createTypeOrmConnection, Connection, ConnectionOptions} from "typeorm";
import {runSeeder} from "typeorm-seeding";
import CreateBase from "./seeds/base";
import CreatePHT from "./seeds/pht";
import ServiceSeeder from "./seeds/service";
import {createTypeOrmConnectionOptions} from "./connection";
import {useLogger} from "../modules/log";
import path from "path";
import * as fs from "fs";

function createDbSchema(databaseExists: boolean = false) {
    return createTypeOrmConnectionOptions()
        .then((options: ConnectionOptions) => createTypeOrmConnection(options))
        .then((connection: Connection) => {
            useLogger().info('sync schema...', {namespace: 'db.setup'});

            return connection.synchronize(false)
                .then(() => {
                    return new Promise((resolve: (value: void) => any) => {
                        if(databaseExists) {
                            useLogger().info('skip seeds (database exists)...', {namespace: 'db.setup'})
                            resolve();
                        } else {
                            useLogger().info('run seeds...', {namespace: 'db.setup'})
                            return Promise.all([
                                runSeeder(CreateBase),
                                runSeeder(CreatePHT),
                                runSeeder(ServiceSeeder)
                            ]).then(() => resolve());
                        }
                    });
                })
                .then(() => process.exit(0))
                .catch((e) => {
                    useLogger().error(e.message, {namespace: 'db.setup'});
                    process.exit(1)
                });
        })
        .catch((e) => {
            useLogger().error(e.message, {namespace: 'db.setup'});
            process.exit(1);
        });
}

export function setupDatabase() {
    const dbms = requireFromEnv('TYPEORM_CONNECTION');

    useLogger().info('init connection...', {namespace: 'db.setup'});

    // in case of sqlite no db must be created manually.
    if(dbms === 'sqlite') {
        const database = requireFromEnv('TYPEORM_DATABASE');
        const filePath = path.join(process.cwd(), database);
        const databaseExists = fs.existsSync(filePath);
        return createDbSchema(databaseExists);
    }

    if(dbms !== 'mysql') {
        useLogger().error(dbms + ' is not supported by default.', {namespace: 'db.setup'});
        process.exit(0);
    }

    const connection = createMysqlConnection({
        host: requireFromEnv('TYPEORM_HOST'),
        user: requireFromEnv('TYPEORM_USERNAME'),
        password: requireFromEnv('TYPEORM_PASSWORD'),
        port: Number(requireFromEnv('TYPEORM_PORT', '3306'))
    });

    return connection.connect((err: MysqlError) => {
        if (err) {
            useLogger().error(err.message, {namespace: 'db.setup'});
            process.exit(1);
        }

        useLogger().info('connection established.', {namespace: 'db.setup'});

        const database = requireFromEnv('TYPEORM_DATABASE');
        return connection.query("CREATE DATABASE "+database+" CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", (queryErr: MysqlError) => {
            if (queryErr) {
                if(queryErr.code === 'ER_DB_CREATE_EXISTS') {
                    createDbSchema(true)
                        .then(() => process.exit(0))
                        .catch(() => process.exit(1));

                    return;
                }

                useLogger().error(queryErr.message, {namespace: 'db.setup'});
                process.exit(1);
                return;
            }

            return createDbSchema()
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
        });
    });
}
