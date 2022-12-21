/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DatabaseSeeder } from '@authup/server-database';
import { DataSource } from 'typeorm';
import {
    checkDatabase, createDatabase, setDataSource, setupDatabaseSchema,
} from 'typeorm-extension';
import { URL } from 'url';
import { createConfig, getWritableDirPath, useLogger } from '../config';
import { DatabaseRootSeeder } from '../database/seeds/root';
import { buildDataSourceOptions } from '../database/utils';
import env from '../env';
import { createRouter } from '../http/router';
import { createHttpServer } from '../http/server';
import { generateSwaggerDocumentation } from '../http/swagger';
import { StartCommandContext } from './type';

export async function startCommand(context?: StartCommandContext) {
    context = context || {};
    const config = await createConfig({ env });

    const logger = useLogger();

    logger.info(`Environment: ${env.env}`);
    logger.info(`WritableDirectoryPath: ${getWritableDirPath()}`);
    logger.info(`Port: ${env.port}`);
    logger.info(`Public-URL: ${env.apiUrl}`);
    logger.info(`Docs-URL: ${new URL('docs/', env.apiUrl).href}`);

    logger.info('Generating documentation...');

    await generateSwaggerDocumentation();

    logger.info('Generated documentation.');

    const options = await buildDataSourceOptions();
    const check = await checkDatabase({
        options,
        dataSourceCleanup: true,
    });

    if (!check.exists) {
        await createDatabase({ options, synchronize: false, ifNotExist: true });
    }

    logger.info('Establishing database connection...');

    const dataSource = new DataSource(options);
    await dataSource.initialize();

    setDataSource(dataSource);

    logger.info('Established database connection.');

    if (!check.schema) {
        logger.info('Applying database schema...');

        await setupDatabaseSchema(dataSource);

        logger.info('Applied database schema.');
    }

    if (!check.schema) {
        logger.info('Seeding database...');
    }

    const authSeeder = new DatabaseSeeder({
        adminPasswordReset: context.databaseAdminPasswordReset ?? false,
        robotSecretReset: context.databaseRobotSecretReset ?? false,
    });
    await authSeeder.run(dataSource);

    if (!check.schema) {
        const coreSeeder = new DatabaseRootSeeder();
        await coreSeeder.run(dataSource);
    }

    if (!check.schema) {
        logger.info('Seeded database');
    }

    const router = createRouter();
    const httpServer = createHttpServer({ router });

    config.components.forEach((c) => c.start());
    config.aggregators.forEach((a) => a.start());

    httpServer.listen(env.port, '0.0.0.0', () => {
        logger.info('Started http server.');
    });
}
