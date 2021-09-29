/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

#!/usr/bin/env node
import 'reflect-metadata';
import yargs from 'yargs';
import {SetupCommand} from "./commands/setup";
import {UpgradeCommand} from "./commands/upgrade";
import {ResetCommand} from "./commands/reset";

// tslint:disable-next-line:no-unused-expression
yargs
    .usage("Usage: $0 <command> [options]")
    .demandCommand(1)
    .command(new SetupCommand())
    .command(new UpgradeCommand())
    .command(new ResetCommand())
    .strict()
    .alias("v", "version")
    .help("h")
    .alias("h", "help")
    .argv;
