/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Argv, CommandModule } from 'yargs';
import { upgradeCommand } from '@authelion/server-core';
import { createConfig, useLogger } from '../../config';
import env from '../../env';
import { generateSwaggerDocumentation } from '../../http/swagger';

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

        const logger = useLogger();

        await upgradeCommand({ logger });

        await generateSwaggerDocumentation();

        process.exit(0);
    }
}
