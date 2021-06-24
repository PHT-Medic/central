#!/usr/bin/env node
import 'reflect-metadata';
import yargs from 'yargs';
import {AuthSetupCommand} from "../modules/auth/cli/commands/setup";
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
    .command(new AuthSetupCommand())
    .strict()
    .alias("v", "version")
    .help("h")
    .alias("h", "help")
    .argv;
