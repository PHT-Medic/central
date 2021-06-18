#!/usr/bin/env node
import 'reflect-metadata';
import yargs from 'yargs';
import {DatabaseSeedCommand} from "./db/cli/commands/seed";
import {DatabaseMigrationShowCommand} from "./db/cli/commands/migration/show";
import {DatabaseMigrationRunCommand} from "./db/cli/commands/migration/run";
import {DatabaseMigrationRevertCommand} from "./db/cli/commands/migration/revert";

// tslint:disable-next-line:no-unused-expression
yargs
    .usage("Usage: $0 <command> [options]")
    .demandCommand(1)
    .command(new DatabaseSeedCommand())
    .command(new DatabaseMigrationShowCommand())
    .command(new DatabaseMigrationRunCommand())
    .command(new DatabaseMigrationRevertCommand())
    .strict()
    .alias("v", "version")
    .help("h")
    .alias("h", "help")
    .argv;
