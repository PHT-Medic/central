/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import { buildConnectionOptions, createDatabase, runSeeder } from 'typeorm-extension';
import { createConnection } from 'typeorm';
import { createSecurityKeyPair } from '@typescript-auth/server';
import { getWritableDirPath } from '../../config/paths';
import { generateSwaggerDocumentation } from '../../config/http/swagger';

interface SetupArguments extends Arguments {
    auth: boolean,
    database: boolean,
    documentation: boolean,
    'database-seeder': boolean
}

export class SetupCommand implements CommandModule {
    command = 'setup';

    describe = 'Run initial setup operation.';

    // eslint-disable-next-line class-methods-use-this
    builder(args: Argv) {
        return args
            .option('auth', {
                describe: 'Setup auth module.',
                type: 'boolean',
            })

            .option('database', {
                alias: 'db',
                describe: 'Setup database module.',
                type: 'boolean',
            })

            .option('documentation', {
                alias: 'docs',
                describe: 'Setup documentation.',
                type: 'boolean',
            })

            .option('database-seeder', {
                alias: 'db:seed',
                describe: 'Setup database seeds.',
                type: 'boolean',
            });
    }

    // eslint-disable-next-line class-methods-use-this
    async handler(args: SetupArguments) {
        if (
            !args.auth &&
            !args.database &&
            !args['database-seeder'] &&
            !args.documentation
        ) {
            // eslint-disable-next-line no-multi-assign
            args.auth = args.database = args['database-seeder'] = args.documentation = true;
        }

        /**
         * Setup auth module
         */
        if (args.auth) {
            await createSecurityKeyPair({ directory: getWritableDirPath() });
        }

        if (args.documentation) {
            await generateSwaggerDocumentation();
        }

        if (args.database || args['database-seeder']) {
            /**
             * Setup database with schema & seeder
             */
            const connectionOptions = await buildConnectionOptions();

            if (args.database) {
                await createDatabase({ ifNotExist: true }, connectionOptions);
            }

            const connection = await createConnection(connectionOptions);
            try {
                await connection.synchronize();

                if (args['database-seeder']) {
                    await runSeeder(connection);
                }
            } catch (e) {
                console.log(e);
                await connection.close();
                process.exit(1);
                throw e;
            } finally {
                await connection.close();
            }
        }

        process.exit(0);
    }
}
