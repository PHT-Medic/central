import {requireFromEnv} from './env';
import {createConnection as createMysqlConnection, MysqlError} from 'mysql';
import {createConnection as createTypeOrmConnection, Connection} from "typeorm";
import {runSeeder} from "typeorm-seeding";
import CreateBase from "./db/seeds/base";
import CreatePHT from "./db/seeds/pht";

const args = process.argv.slice(2);

function createDbSchema() {
    return createTypeOrmConnection()
        .then((connection: Connection) => {
            console.log('Setup schema...');

            return connection.synchronize(true)
                .then(() => runSeeder(CreateBase))
                .then(() => runSeeder(CreatePHT))
                .then(() => process.exit(0))
                .catch((e) => {
                    console.log(e);
                    process.exit(1)
                });
        })
        .catch((e) => {
            console.log(e);
            process.exit(1);
        });
}

function setup() {
    switch (args[0]) {
        case 'db':
            const dbms = requireFromEnv('TYPEORM_CONNECTION');
            console.log('setup '+dbms+' db...');

            if(dbms === 'sqlite') {
                return createDbSchema();
            }

            if(dbms !== 'mysql') {
                console.log('setup for '+dbms+' is not supported...');
                process.exit(0);
            }

            const connection = createMysqlConnection({
                host: requireFromEnv('TYPEORM_HOST'),
                user: requireFromEnv('TYPEORM_USERNAME'),
                password: requireFromEnv('TYPEORM_PASSWORD')
            });

            return connection.connect(function(err: MysqlError) {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }

                console.log('connection established...');

                const database = requireFromEnv('TYPEORM_DATABASE');
                return connection.query("CREATE DATABASE "+database+" CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",function (err: MysqlError, result: any) {
                    if (err) {
                        if(err.code === 'ER_DB_CREATE_EXISTS') {
                            createDbSchema()
                                .then(() => process.exit(0))
                                .catch(() => process.exit(1));

                            return;
                        }

                        console.log(err);
                        process.exit(1);
                        return;
                    }

                    return createDbSchema()
                        .then(() => process.exit(0))
                        .catch(() => process.exit(1));
                });
            });
        default:
            process.exit(0);
            break;
    }
}

setup();
