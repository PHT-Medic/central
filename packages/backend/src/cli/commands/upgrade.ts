import {Arguments, Argv, CommandModule} from "yargs";
import {buildConnectionOptions} from "typeorm-extension";
import {createConnection} from "typeorm";

interface UpgradeArguments extends Arguments {

}

export class UpgradeCommand implements CommandModule {
    command = "upgrade";
    describe = "Run upgrade operation.";

    builder(args: Argv) {
        return args;
    }

    async handler(args: UpgradeArguments) {
        const connectionOptions = await buildConnectionOptions();

        const connection = await createConnection(connectionOptions);

        if(process.env.NODE_ENV === 'development') {
            await connection.synchronize();
        }

        try {
            await connection.runMigrations({transaction: "all"});
        } catch (e) {
            throw e;
        } finally {
            await connection.close();
        }

    }
}
