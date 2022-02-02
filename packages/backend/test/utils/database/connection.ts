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
import {
    DatabaseRootSeeder as AuthDatabaseRootSeeder,
    setEntitiesForConnectionOptions,
} from '@typescript-auth/server';
import { PermissionKey } from '@personalhealthtrain/ui-common';
import { modifyDatabaseConnectionOptions } from '../../../src/database/utils';
import { buildRobotAggregator } from '../../../src/aggregators/robot';

async function createConnectionOptions() {
    return {
        ...await buildConnectionOptions(),
        database: 'test',
    } as ConnectionWithSeederOptions;
}

export async function useTestDatabase() {
    const connectionOptions = modifyDatabaseConnectionOptions(
        setEntitiesForConnectionOptions(await createConnectionOptions(), true),
    );

    await createDatabase({ ifNotExist: true }, connectionOptions);

    const connection = await createConnection(connectionOptions as ConnectionOptions);
    await connection.synchronize();

    const { start } = buildRobotAggregator();
    start({ synchronous: true });

    const authSeeder = new AuthDatabaseRootSeeder({
        permissions: Object.values(PermissionKey),
        userName: 'admin',
        userPassword: 'start123',
    });
    await authSeeder.run(connection);

    return connection;
}

export async function dropTestDatabase() {
    const connectionOptions = await createConnectionOptions();

    await getConnection()
        .close();

    await dropDatabase({ ifExist: true }, connectionOptions);
}
