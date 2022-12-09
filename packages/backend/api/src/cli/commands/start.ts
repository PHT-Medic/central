/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import dotenv from 'dotenv';
import { Arguments, CommandModule } from 'yargs';
import { startCommand } from '../../commands';

interface StartArguments extends Arguments {

}

export class StartCommand implements CommandModule {
    command = 'start';

    describe = 'Start the backend server.';

    // eslint-disable-next-line class-methods-use-this
    async handler(args: StartArguments) {
        dotenv.config();

        await startCommand();
    }
}
