/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    ConnectionWithSeederOptions, buildConnectionOptions, createDatabase, dropDatabase,
} from 'typeorm-extension';
import { ConnectionOptions, createConnection, getConnection } from 'typeorm';
import DatabaseCoreSeeder from '../../../src/database/seeds/core';

async function createConnectionOptions() {
    return {
        ...await buildConnectionOptions(),
        database: 'test',
    } as ConnectionWithSeederOptions;
}

export async function useTestDatabase() {
    const connectionOptions = await createConnectionOptions();
    await createDatabase({ ifNotExist: true }, connectionOptions);

    const connection = await createConnection(connectionOptions as ConnectionOptions);
    await connection.synchronize();

    const core = new DatabaseCoreSeeder();

    await core.run(null, connection);

    return connection;
}

export async function dropTestDatabase() {
    const connectionOptions = await createConnectionOptions();

    await getConnection()
        .close();

    await dropDatabase({ ifExist: true }, connectionOptions);
}
