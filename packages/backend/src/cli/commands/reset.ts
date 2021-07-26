import {Arguments, Argv, CommandModule} from "yargs";
import {buildConnectionOptions, runSeeder} from "typeorm-extension";
import {createConnection} from "typeorm";

interface ResetArguments extends Arguments {

}

export class ResetCommand implements CommandModule {
    command = "reset";
    describe = "Run reset operation.";

    builder(args: Argv) {
        return args;
    }

    async handler(args: ResetArguments) {
        const connectionOptions = await buildConnectionOptions();

        const connection = await createConnection(connectionOptions);

        try {
            await connection.synchronize(true);
            await connection.runMigrations({transaction: "all"});
            await runSeeder(connection);
        } catch (e) {
            throw e;
        } finally {
            await connection.close();
        }

    }
}
