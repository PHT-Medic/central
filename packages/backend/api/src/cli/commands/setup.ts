/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import { createDatabase } from 'typeorm-extension';
import { DatabaseRootSeeder as AuthDatabaseRootSeeder, setupCommand } from '@authelion/api-core';
import { PermissionKey } from '@personalhealthtrain/central-common';
import { useClient } from 'redis-extension';
import { DataSource } from 'typeorm';
import { createConfig } from '../../config';
import env from '../../env';
import { buildDataSourceOptions } from '../../database/utils';
import { generateSwaggerDocumentation } from '../../http/swagger';
import { DatabaseRootSeeder } from '../../database/seeds/root';
import { buildRobotAggregator } from '../../aggregators/robot';
import { useSpinner } from '../../config/spinner';

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
        const spinner = useSpinner();

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
                spinner,
                database: false,
                databaseSeeder: false, // false, to trigger own subscribers
                documentation: false,
                keyPair: true,
            });
        }

        if (args.documentation) {
            spinner.start('generating documentation...');
            await generateSwaggerDocumentation();
            spinner.succeed('generated documentation.');
        }

        if (args.database || args.databaseSeeder) {
            /**
             * Setup database with schema & seeder
             */
            const options = await buildDataSourceOptions();

            if (args.database) {
                spinner.start('create database...');
                await createDatabase({ options });
                spinner.succeed('created database.');
            }

            const dataSource = new DataSource(options);
            await dataSource.initialize();

            try {
                spinner.start('synchronize database...');
                await dataSource.synchronize();
                spinner.succeed('synchronized database...');

                if (args.databaseSeeder) {
                    spinner.start('seeding database...');
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
                    await authSeeder.run(dataSource);

                    const coreSeeder = new DatabaseRootSeeder();
                    await coreSeeder.run(dataSource);
                    spinner.start('seeded database...');
                }
            } catch (e) {
                spinner.start('seeding database failed...');
                await dataSource.destroy();
                process.exit(1);
                throw e;
            } finally {
                await dataSource.destroy();
            }
        }

        process.exit(0);
    }
}
