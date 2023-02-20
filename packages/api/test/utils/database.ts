/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    createDatabase,
    dropDatabase,
    setDataSource,
    unsetDataSource,
    useDataSource,
} from 'typeorm-extension';
import {
    DataSource,
} from 'typeorm';
import {
    DatabaseSeeder as AuthDatabaseRootSeeder,
} from '@authup/server-database';
import { PermissionKey } from '@personalhealthtrain/central-common';
import { buildDataSourceOptions } from '../../src/database/utils';

export async function useTestDatabase() {
    const options = await buildDataSourceOptions();

    await dropDatabase({ options, ifExist: true });
    await createDatabase({ options, synchronize: false });

    const dataSource = new DataSource(options);
    await dataSource.initialize();
    await dataSource.runMigrations();

    setDataSource(dataSource);

    const authSeeder = new AuthDatabaseRootSeeder({
        permissions: Object.values(PermissionKey),
        robotEnabled: true,
    });
    await authSeeder.run(dataSource);

    return dataSource;
}

export async function dropTestDatabase() {
    const dataSource = await useDataSource();
    await dataSource.destroy();

    const { options } = dataSource;

    unsetDataSource();

    await dropDatabase({ ifExist: true, options });
}
