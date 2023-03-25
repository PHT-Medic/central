/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Arguments, Argv, CommandModule } from 'yargs';
import {
    dropDatabase,
} from 'typeorm-extension';
import { useLogger } from '../../config';
import { buildDataSourceOptions } from '../../database';

interface ResetArguments extends Arguments {

}

export class ResetCommand implements CommandModule {
    command = 'reset';

    describe = 'Run reset operation.';

    builder(args: Argv) {
        return args;
    }

    async handler(args: ResetArguments) {
        const spinner = useLogger();

        spinner.info('Executing database reset...');
        const options = await buildDataSourceOptions();
        await dropDatabase({ options });
        spinner.info('executed database reset.');

        process.exit(0);
    }
}
