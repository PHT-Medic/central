// Update with your config settings.

import paths from "../config/paths";

const environments = {
    development: {
        client: 'sqlite3',
        connection: {
            filename: paths.writablePath + '/db.sqlite'
        },
        seeds: {
            directory: './seeds'
        },
        migrations: {
            tableName: 'migrations'
        }
    },

    staging: {
        client: 'postgresql',
        connection: {
            timezone: 'Europe/Berlin',
            database: 'my_db',
            user:     'username',
            password: 'password'
        },
        pool: {
            min: 2,
            max: 10,
            afterCreate: (conn: any, cb: any) => {
                conn.query(`SET timezone = 'Europe/Berlin'`, (err: any) => {
                    cb(err, conn);
                });
            }
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },

    production: {
        client: 'postgresql',
        connection: {
            database: 'my_db',
            user:     'username',
            password: 'password'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }
};

let development = environments.development;

export {
    development
};

export default environments;
