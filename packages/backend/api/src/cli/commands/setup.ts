/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import { createDatabase, setDataSource } from 'typeorm-extension';
import { DatabaseSeeder, setupCommand } from '@authelion/server-core';
import { DataSource } from 'typeorm';
import { createConfig, useLogger } from '../../config';
import env from '../../env';
import { buildDataSourceOptions } from '../../database/utils';
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
        createConfig({ env });

        const logger = useLogger();

        if (
            typeof args.auth === 'undefined' &&
            typeof args.database === 'undefined' &&
            typeof args.databaseSeeder === 'undefined' &&
            typeof args.documentation === 'undefined'
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
                databaseSeed: false,
                documentation: false,
            });
        }

        if (args.documentation) {
            logger.info('generating documentation...');
            await generateSwaggerDocumentation();
            logger.info('generated documentation.');
        }

        if (args.database || args.databaseSeeder) {
            /**
             * Setup database with schema & seeder
             */
            const options = await buildDataSourceOptions();

            if (args.database) {
                logger.info('create database...');
                await createDatabase({ options, synchronize: false });
                logger.info('created database.');
            }

            const dataSource = new DataSource(options);
            await dataSource.initialize();
            await dataSource.runMigrations();

            setDataSource(dataSource);

            try {
                if (args.databaseSeeder) {
                    logger.info('seeding database...');

                    const aggregator = buildRobotAggregator();
                    aggregator.start({ synchronous: true });

                    const authSeeder = new DatabaseSeeder();
                    await authSeeder.run(dataSource);

                    const coreSeeder = new DatabaseRootSeeder();
                    await coreSeeder.run(dataSource);
                    logger.info('seeded database...');
                }
            } catch (e) {
                logger.info('seeding database failed...');
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
