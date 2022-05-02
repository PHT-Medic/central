/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import {
    dropDatabase,
} from 'typeorm-extension';
import { useSpinner } from '../../config/spinner';
import { buildDataSourceOptions } from '../../database/utils';

interface ResetArguments extends Arguments {

}

export class ResetCommand implements CommandModule {
    command = 'reset';

    describe = 'Run reset operation.';

    builder(args: Argv) {
        return args;
    }

    async handler(args: ResetArguments) {
        const spinner = useSpinner();

        spinner.start('executing database reset...');
        const options = await buildDataSourceOptions();
        await dropDatabase({ options });
        spinner.succeed('executed database reset.');

        process.exit(0);
    }
}
