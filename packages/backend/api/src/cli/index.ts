#!/usr/bin/env node

import 'reflect-metadata';
import yargs from 'yargs';
import { MigrationGenerateCommand } from './commands/migration-generate';
import { MigrationRevertCommand } from './commands/migration-revert';
import { MigrationStatusCommand } from './commands/migration-status';
import { SetupCommand } from './commands/setup';
import { UpgradeCommand } from './commands/upgrade';
import { ResetCommand } from './commands/reset';
import { CheckCommand } from './commands/check';

// eslint-disable-next-line no-unused-expressions,@typescript-eslint/no-unused-expressions
yargs
    .usage('Usage: $0 <command> [options]')
    .demandCommand(1)
    .command(new CheckCommand())
    .command(new MigrationGenerateCommand())
    .command(new MigrationRevertCommand())
    .command(new MigrationStatusCommand())
    .command(new SetupCommand())
    .command(new UpgradeCommand())
    .command(new ResetCommand())
    .strict()
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help')
    .argv;
