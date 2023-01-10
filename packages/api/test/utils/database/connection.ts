/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    createDatabase, dropDatabase, setDataSource, unsetDataSource, useDataSource,
} from 'typeorm-extension';
import {
    DataSource, DataSourceOptions,
} from 'typeorm';
import {
    DatabaseSeeder as AuthDatabaseRootSeeder,
} from '@authup/server-database';
import { PermissionKey } from '@personalhealthtrain/central-common';
import { buildDataSourceOptions } from '../../../src/database/utils';

async function buildOptions() : Promise<DataSourceOptions> {
    return {
        ...await buildDataSourceOptions(),
        database: 'test',
    } as DataSourceOptions;
}

export async function useTestDatabase() {
    const options = await buildOptions();

    await createDatabase({ options, synchronize: false });

    const dataSource = new DataSource(options);
    await dataSource.initialize();
    await dataSource.synchronize();

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

    await dropDatabase({ options });
}
