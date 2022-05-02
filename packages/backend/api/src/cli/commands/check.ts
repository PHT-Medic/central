/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import {
    DatabaseRootSeeder,
    useConfig,
} from '@authelion/api-core';
import { PermissionKey } from '@personalhealthtrain/central-common';
import { DataSource } from 'typeorm';
import { useSpinner } from '../../config/spinner';
import env from '../../env';
import { buildDataSourceOptions } from '../../database/utils';

interface SeedCheckArguments extends Arguments {

}

export class CheckCommand implements CommandModule {
    command = 'check';

    describe = 'Check integration of the application(s).';

    builder(args: Argv) {
        return args;
    }

    async handler(args: SeedCheckArguments) {
        const spinner = useSpinner();

        const dataSourceOptions = await buildDataSourceOptions();
        const dataSource = new DataSource(dataSourceOptions);

        await dataSource.initialize();

        try {
            if (env.env !== 'production') {
                spinner.start('synchronizing database...');
                await dataSource.synchronize();
                spinner.succeed('synchronized database.');
            }

            spinner.start('checking database integrity...');
            const authConfig = useConfig();
            const authSeeder = new DatabaseRootSeeder({
                userName: authConfig.adminUsername,
                userPassword: authConfig.adminPassword,
                permissions: Object.values(PermissionKey),
            });
            await authSeeder.run(dataSource);
            spinner.succeed('checked database integrity.');
        } catch (e) {
            spinner.fail('checking database integrity failed.');
            await dataSource.destroy();
            process.exit(1);
            throw e;
        } finally {
            await dataSource.destroy();
            process.exit(0);
        }
    }
}
