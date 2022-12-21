/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDatabase, setupDatabaseSchema } from 'typeorm-extension';
import { CommandModule } from 'yargs';
import { DataSource } from 'typeorm';
import { generateMigration } from '@authup/server-database';
import path from 'path';
import { createConfig } from '../../config';
import env from '../../env';
import { buildDataSourceOptions } from '../../database/utils';

export class MigrationGenerateCommand implements CommandModule {
    command = 'migration:generate';

    describe = 'Generate database migrations.';

    async handler(args: any) {
        createConfig({ env });

        const options = await buildDataSourceOptions();

        await createDatabase({ options, ifNotExist: true });

        const dataSource = new DataSource(options);
        await dataSource.initialize();

        if (dataSource.migrations.length > 0) {
            await setupDatabaseSchema(dataSource);
        }

        await generateMigration({
            dataSource,
            name: 'Default',
            directoryPath: path.join(__dirname, '..', '..', 'database', 'migrations'),
        });

        process.exit(0);
    }
}
