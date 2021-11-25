/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import { buildConnectionOptions, createDatabase, runSeeder } from 'typeorm-extension';
import { createConnection } from 'typeorm';
import { createSecurityKeyPair } from '@typescript-auth/server';
import { getWritableDirPath } from '../../config/paths';

interface SetupArguments extends Arguments {
    auth: 'yes' | 'no',
    database: 'yes' | 'no',
    databaseSeeder: 'yes' | 'no'
}

export class SetupCommand implements CommandModule {
    command = 'setup';

    describe = 'Run initial setup operation.';

    builder(args: Argv) {
        return args
            .option('auth', {
                default: 'yes',
                describe: 'Setup auth module.',
                choices: ['yes', 'no'],
            })

            .option('database', {
                alias: 'db',
                default: 'yes',
                describe: 'Setup database module.',
                choices: ['yes', 'no'],
            })

            .option('databaseSeeder', {
                alias: 'db:seed',
                default: 'yes',
                describe: 'Setup database seeds.',
                choices: ['yes', 'no'],
            });
    }

    async handler(args: SetupArguments) {
        /**
         * Setup auth module
         */
        if (args.auth === 'yes') {
            await createSecurityKeyPair({ directory: getWritableDirPath() });
        }

        /**
         * Setup database with schema & seeder
         */
        const connectionOptions = await buildConnectionOptions();

        if (args.database === 'yes') {
            await createDatabase({ ifNotExist: true }, connectionOptions);
        }

        const connection = await createConnection(connectionOptions);
        try {
            await connection.synchronize();

            if (args.databaseSeeder === 'yes') {
                await runSeeder(connection);
            }
        } catch (e) {
            console.log(e);
            await connection.close();
            process.exit(1);
            throw e;
        } finally {
            await connection.close();
            process.exit(0);
        }
    }
}
