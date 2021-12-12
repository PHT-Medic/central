/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import { createConnection } from 'typeorm';
import { buildConnectionOptions } from 'typeorm-extension';

interface SeedCheckArguments extends Arguments {

}

export class CheckCommand implements CommandModule {
    command = 'check';

    describe = 'Check integration of the application(s).';

    builder(args: Argv) {
        return args;
    }

    async handler(args: SeedCheckArguments) {
        const connectionOptions = await buildConnectionOptions();
        const connection = await createConnection(connectionOptions);

        try {
            await connection.synchronize();

            const base = await import('../../database/seeds/core');
            // eslint-disable-next-line new-cap
            const baseSeeder = new base.default();
            await baseSeeder.run(null, connection);
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
