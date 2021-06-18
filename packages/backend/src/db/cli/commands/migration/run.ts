import {CommandModule, Arguments, Argv} from "yargs";
import {createTypeOrmConnectionOptions} from "../../../connection";
import {createConnection} from "typeorm";

export class DatabaseMigrationRunCommand implements CommandModule {
    command = "db:migration:run";
    aliases = "db:migrations:run";
    describe = "Runs all pending migrations.";

    async handler(args: Arguments<{}>) {
        await runDatabaseMigrations();
    }
}

export async function runDatabaseMigrations() {
    const connectionOptions = await createTypeOrmConnectionOptions();

    Object.assign(connectionOptions, {
        subscribers: [],
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        logging: ["query", "error", "schema"]
    });

    const connection = await createConnection(connectionOptions);

    await connection.runMigrations({
        transaction: "all"
    });

    process.exit(0)
}
