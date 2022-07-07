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
import { createConfig } from '../../config/module';
import env from '../../env';

export class UpgradeCommand implements CommandModule {
    command = 'upgrade';

    describe = 'Run upgrade operation.';

    // eslint-disable-next-line class-methods-use-this
    builder(args: Argv) {
        return args;
    }

    // eslint-disable-next-line class-methods-use-this
    async handler() {
        createConfig({ env });

        const spinner = useSpinner();
        const options = await buildDataSourceOptions();

        await upgradeCommand({
            spinner,
        });

        const dataSource = new DataSource(options);
        await dataSource.initialize();

        try {
            await dataSource.runMigrations();
            // eslint-disable-next-line no-useless-catch
        } catch (e) {
            spinner.start('Executing migrations failed...');
            await dataSource.destroy();
            process.exit(1);
            throw e;
        } finally {
            await dataSource.destroy();
        }

        process.exit(0);
    }
}
