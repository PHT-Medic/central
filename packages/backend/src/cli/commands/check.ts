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
    modifyDatabaseConnectionOptions,
} from '@typescript-auth/server';
import { useConfig } from '@typescript-auth/server/dist/config';

interface SeedCheckArguments extends Arguments {

}

export class CheckCommand implements CommandModule {
    command = 'check';

    describe = 'Check integration of the application(s).';

    builder(args: Argv) {
        return args;
    }

    async handler(args: SeedCheckArguments) {
        const connectionOptions = modifyDatabaseConnectionOptions(await buildConnectionOptions(), true);
        const connection = await createConnection(connectionOptions);

        try {
            await connection.synchronize();

            const { default: RootSeeder } = await import('../../database/seeds/core');
            const baseSeeder = new RootSeeder();
            await baseSeeder.run(null, connection);

            const authConfig = useConfig();
            const authSeeder = new DatabaseRootSeeder({
                userName: authConfig.adminUsername,
                userPassword: authConfig.adminPassword,
            });
            await authSeeder.run(connection);
        } catch (e) {
            console.log(e);
            await connection.close();
            process.exit(1);
            throw e;
        } finally {
            await connection.close();
            process.exit(0);
        }
    }
}
