import {CommandModule, Arguments, Argv} from "yargs";
import {createTypeOrmConnectionOptions} from "../../../connection";
import {createConnection} from "typeorm";

export class DatabaseMigrationShowCommand implements CommandModule {
    command = "db:migration:show";
    aliases = "db:migrations:show";
    describe = "Show all migrations and whether they have been run or not";

    async handler(args: Arguments<{}>) {
        await showDatabaseMigrations();
    }
}

export async function showDatabaseMigrations() {
    const connectionOptions = await createTypeOrmConnectionOptions();

    Object.assign(connectionOptions, {
        subscribers: [],
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        logging: ["query", "error", "schema"]
    });

    const connection = await createConnection(connectionOptions);

    const openMigrations = await connection.showMigrations();

    process.exit(openMigrations ? 1 : 0);
}
