/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

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

        try {
            await connection.runMigrations({transaction: "all"});
        } catch (e) {
            throw e;
        } finally {
            await connection.close();
        }

    }
}
