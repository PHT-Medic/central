/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Argv, CommandModule } from 'yargs';
import { upgradeCommand } from '@authelion/api-core';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from '../../database/utils';
import { useSpinner } from '../../config/spinner';

export class UpgradeCommand implements CommandModule {
    command = 'upgrade';

    describe = 'Run upgrade operation.';

    // eslint-disable-next-line class-methods-use-this
    builder(args: Argv) {
        return args;
    }

    // eslint-disable-next-line class-methods-use-this
    async handler() {
        const spinner = useSpinner();
        const options = await buildDataSourceOptions();

        await upgradeCommand({
            spinner,
        });

        const dataSource = new DataSource(options);
        await dataSource.initialize();

        try {
            await dataSource.runMigrations({ transaction: 'all' });
            // eslint-disable-next-line no-useless-catch
        } finally {
            await dataSource.destroy();
        }
    }
}
