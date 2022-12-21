#!/usr/bin/env node

import 'reflect-metadata';
import yargs from 'yargs';
import { MigrationGenerateCommand } from './commands/migration-generate';
import { MigrationRevertCommand } from './commands/migration-revert';
import { MigrationStatusCommand } from './commands/migration-status';
import { StartCommand } from './commands/start';
import { ResetCommand } from './commands/reset';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// eslint-disable-next-line no-unused-expressions,@typescript-eslint/no-unused-expressions
yargs
    .usage('Usage: $0 <command> [options]')
    .demandCommand(1)
    .command(new MigrationGenerateCommand())
    .command(new MigrationRevertCommand())
    .command(new MigrationStatusCommand())
    .command(new StartCommand())
    .command(new ResetCommand())
    .strict()
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help')
    .argv;
