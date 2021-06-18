import {CommandModule, Arguments, Argv} from "yargs";
import {createTypeOrmConnectionOptions} from "../../connection";
import {createConnection} from "typeorm";

import glob from "glob";
import path from "path";
import {getWritableDirPath} from "../../../config/paths";
import {runSeeder} from "typeorm-seeding";

export class DatabaseSeedCommand implements CommandModule {
    command = "db:seed";
    describe = "Create initial database sets.";

    async handler(args: Arguments<{}>) {
        await createDatabaseSeed();
    }
}

export async function createDatabaseSeed() {
    const connectionOptions = await createTypeOrmConnectionOptions();

    const connection = await createConnection(connectionOptions);

    const files = glob.sync(path.resolve(__dirname, '../../seeds/*.{js|ts}'));

    const objects = await Promise.all(files.map(file => import(file)));

    for(const object of objects) {
        await runSeeder(object);
    }
}
