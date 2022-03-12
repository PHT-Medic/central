/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import { createConnection } from 'typeorm';
import { buildConnectionOptions } from 'typeorm-extension';
import {
    DatabaseRootSeeder,
    setEntitiesForConnectionOptions,
    useConfig,
} from '@authelion/api-core';
import { PermissionKey } from '@personalhealthtrain/central-common';
import { useSpinner } from '../../config/spinner';
import env from '../../env';

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

        const connectionOptions = setEntitiesForConnectionOptions(await buildConnectionOptions(), true);
        const connection = await createConnection(connectionOptions);

        try {
            if (env.env !== 'production') {
                spinner.start('synchronizing database...');
                await connection.synchronize();
                spinner.succeed('synchronized database.');
            }

            spinner.start('checking database integrity...');
            const authConfig = useConfig();
            const authSeeder = new DatabaseRootSeeder({
                userName: authConfig.adminUsername,
                userPassword: authConfig.adminPassword,
                permissions: Object.values(PermissionKey),
            });
            await authSeeder.run(connection);
            spinner.succeed('checked database integrity.');
        } catch (e) {
            spinner.fail('checking database integrity failed.');
            await connection.close();
            process.exit(1);
            throw e;
        } finally {
            await connection.close();
            process.exit(0);
        }
    }
}
