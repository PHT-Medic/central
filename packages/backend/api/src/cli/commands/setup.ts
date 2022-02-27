/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import { createDatabase } from 'typeorm-extension';
import { createConnection } from 'typeorm';
import { DatabaseRootSeeder as AuthDatabaseRootSeeder, setupCommand } from '@typescript-auth/server-core';
import { PermissionKey } from '@personalhealthtrain/central-common';
import { useClient } from 'redis-extension';
import { createConfig } from '../../config';
import env from '../../env';
import { buildDatabaseConnectionOptions } from '../../database/utils';
import { generateSwaggerDocumentation } from '../../http/swagger';
import { DatabaseRootSeeder } from '../../database/seeds/root';
import { buildRobotAggregator } from '../../aggregators/robot';

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
                documentation: false, // todo: make true again if external dependencies can be used to generate swagger docs.
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
                    createConfig({ env });

                    const redis = useClient();
                    if (redis.status !== 'connecting') {
                        await redis.connect();
                    }

                    const aggregator = buildRobotAggregator();
                    aggregator.start({ synchronous: true });

                    const authSeeder = new AuthDatabaseRootSeeder({
                        permissions: Object.values(PermissionKey),
                        userName: 'admin',
                        userPassword: 'start123',
                    });
                    await authSeeder.run(connection);

                    const coreSeeder = new DatabaseRootSeeder();
                    await coreSeeder.run(connection);
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
