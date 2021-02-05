import {requireFromEnv} from './env';
import {createConnection as createMysqlConnection, MysqlError} from 'mysql';
import {createConnection as createTypeOrmConnection, Connection} from "typeorm";

const args = process.argv.slice(2);

function createDbSchema() {
    return createTypeOrmConnection().then((connection: Connection) => {
        connection.synchronize(false)
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    });
}

switch (args[0]) {
    case 'db':
        const dbms = requireFromEnv('TYPEORM_CONNECTION');
        console.log('setup '+dbms+' db...');

        if(dbms === 'sqlite3') {
            break;
        }

        if(dbms !== 'mysql') {
            console.log('setup for '+dbms+' is not supported...');
        }

        const connection = createMysqlConnection({
            host: requireFromEnv('TYPEORM_HOST'),
            user: requireFromEnv('TYPEORM_USERNAME'),
            password: requireFromEnv('TYPEORM_PASSWORD')
        });

        connection.connect(function(err: MysqlError) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            const database = requireFromEnv('TYPEORM_DATABASE');
            connection.query("CREATE DATABASE "+database+" CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",function (err: MysqlError, result: any) {
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

                createDbSchema()
                    .then(() => process.exit(0))
                    .catch(() => process.exit(1));
            });
        });
        break;
    default:
        process.exit(0);
        break;
}

