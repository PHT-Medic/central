/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import { createDatabase } from 'typeorm-extension';
import { createConnection } from 'typeorm';
import { DatabaseRootSeeder, setupCommand } from '@typescript-auth/server';
import { PermissionKey } from '@personalhealthtrain/ui-common';
import { createConfig } from '../../config';
import env from '../../env';
import { buildDatabaseConnectionOptions } from '../../database/utils';
import { generateSwaggerDocumentation } from '../../config/http/swagger';

interface SetupArguments extends Arguments {
    auth: boolean,
    database: boolean,
    documentation: boolean,
    databaseSeeder: boolean
}

export class SetupCommand implements CommandModule {
    command = 'setup';

    describe = 'Run initial setup operation.';

    // eslint-disable-next-line class-methods-use-this
    builder(args: Argv) {
        return args
            .option('auth', {
                describe: 'Setup auth module.',
                type: 'boolean',
            })

            .option('database', {
                alias: 'db',
                describe: 'Setup database module.',
                type: 'boolean',
            })

            .option('documentation', {
                alias: 'docs',
                describe: 'Setup documentation.',
                type: 'boolean',
            })

            .option('databaseSeeder', {
                alias: 'db:seed',
                describe: 'Setup database seeds.',
                type: 'boolean',
            });
    }

    // eslint-disable-next-line class-methods-use-this
    async handler(args: SetupArguments) {
        if (
            !args.auth &&
            !args.database &&
            !args.databaseSeeder &&
            !args.documentation
        ) {
            // eslint-disable-next-line no-multi-assign
            args.auth = args.database = args.databaseSeeder = args.documentation = true;
        }

        /**
         * Setup auth module
         */
        if (args.auth) {
            await setupCommand({
                database: false,
                databaseSeeder: false, // false, to trigger own subscribers
                documentation: true,
                keyPair: true,
            });
        }

        if (args.documentation) {
            await generateSwaggerDocumentation();
        }

        if (args.database || args.databaseSeeder) {
            /**
             * Setup database with schema & seeder
             */
            const connectionOptions = await buildDatabaseConnectionOptions();

            if (args.database) {
                await createDatabase({ ifNotExist: true }, connectionOptions);
            }

            const connection = await createConnection(connectionOptions);

            try {
                await connection.synchronize();

                if (args.databaseSeeder) {
                    const config = createConfig({ env });
                    if (config.redisDatabase.status !== 'connecting') {
                        await config.redisDatabase.connect();
                    }

                    const authSeeder = new DatabaseRootSeeder({
                        permissions: Object.values(PermissionKey),
                        userName: 'admin',
                        userPassword: 'start123',
                    });
                    await authSeeder.run(connection);

                    const { default: CoreSeeder } = await import('../../database/seeds/core');
                    const seeder = new CoreSeeder();
                    await seeder.run(connection);
                }
            } catch (e) {
                console.log(e);
                await connection.close();
                process.exit(1);
                throw e;
            } finally {
                await connection.close();
            }
        }

        process.exit(0);
    }
}
