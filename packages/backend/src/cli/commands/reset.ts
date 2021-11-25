/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import {
    buildConnectionOptions, createDatabase, dropDatabase, runSeeder,
} from 'typeorm-extension';
import { createConnection } from 'typeorm';

interface ResetArguments extends Arguments {

}

export class ResetCommand implements CommandModule {
    command = 'reset';

    describe = 'Run reset operation.';

    builder(args: Argv) {
        return args;
    }

    async handler(args: ResetArguments) {
        const connectionOptions = await buildConnectionOptions();

        await dropDatabase({ ifExist: true });
        await createDatabase({ ifNotExist: true });

        const connection = await createConnection(connectionOptions);

        try {
            await connection.synchronize(true);
            await connection.runMigrations({ transaction: 'all' });
            await runSeeder(connection);
        } catch (e) {
            throw e;
        } finally {
            await connection.close();
        }
    }
}
