/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import {
    DatabaseSeeder,
} from '@authelion/api-core';
import { DataSource } from 'typeorm';
import { useSpinner } from '../../config/spinner';
import env from '../../env';
import { buildDataSourceOptions } from '../../database/utils';
import { createConfig } from '../../config';

interface SeedCheckArguments extends Arguments {

}

export class CheckCommand implements CommandModule {
    command = 'check';

    describe = 'Check integration of the application(s).';

    builder(args: Argv) {
        return args;
    }

    async handler(args: SeedCheckArguments) {
        createConfig({ env });

        const spinner = useSpinner();

        const dataSourceOptions = await buildDataSourceOptions();
        const dataSource = new DataSource(dataSourceOptions);

        await dataSource.initialize();

        try {
            spinner.start('checking database integrity...');

            const authSeeder = new DatabaseSeeder();
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
