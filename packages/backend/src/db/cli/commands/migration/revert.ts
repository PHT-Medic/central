import {CommandModule, Arguments, Argv} from "yargs";
import {createTypeOrmConnectionOptions} from "../../../connection";
import {createConnection} from "typeorm";

export class DatabaseMigrationRevertCommand implements CommandModule {
    command = "db:migration:revert";
    aliases = "db:migrations:revert";
    describe = "Reverts last executed migration.";

    async handler(args: Arguments<{}>) {
        await revertLastDatabaseMigration();
    }
}

export async function revertLastDatabaseMigration() {
    const connectionOptions = await createTypeOrmConnectionOptions();

    Object.assign(connectionOptions, {
        subscribers: [],
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        logging: ["query", "error", "schema"]
    });

    const connection = await createConnection(connectionOptions);

    await connection.undoLastMigration({
        transaction: "all"
    });

    process.exit(0)
}
