/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

#!/usr/bin/env node

import 'reflect-metadata';
import yargs from 'yargs';
import { SetupCommand } from './commands/setup';
import { UpgradeCommand } from './commands/upgrade';
import { ResetCommand } from './commands/reset';
import { CheckCommand } from './commands/check';

// eslint-disable-next-line no-unused-expressions,@typescript-eslint/no-unused-expressions
yargs
    .usage('Usage: $0 <command> [options]')
    .demandCommand(1)
    .command(new CheckCommand())
    .command(new SetupCommand())
    .command(new UpgradeCommand())
    .command(new ResetCommand())
    .strict()
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help')
    .argv;
