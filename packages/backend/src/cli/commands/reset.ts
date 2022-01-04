/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import {
    buildConnectionOptions, dropDatabase,
} from 'typeorm-extension';

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
        await dropDatabase({ ifExist: true }, connectionOptions);

        process.exit(0);
    }
}
