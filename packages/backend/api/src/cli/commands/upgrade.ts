/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Argv, CommandModule } from 'yargs';
import { createConnection } from 'typeorm';
import { upgradeCommand } from '@typescript-auth/server';
import { buildDatabaseConnectionOptions } from '../../database/utils';

export class UpgradeCommand implements CommandModule {
    command = 'upgrade';

    describe = 'Run upgrade operation.';

    // eslint-disable-next-line class-methods-use-this
    builder(args: Argv) {
        return args;
    }

    // eslint-disable-next-line class-methods-use-this
    async handler() {
        const connectionOptions = await buildDatabaseConnectionOptions();

        await upgradeCommand({});

        const connection = await createConnection(connectionOptions);

        try {
            await connection.runMigrations({ transaction: 'all' });
            // eslint-disable-next-line no-useless-catch
        } finally {
            await connection.close();
        }
    }
}