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
import { buildRobotAggregator } from '../../../src/aggregators/robot';

async function buildOptions() : Promise<DataSourceOptions> {
    return {
        ...await buildDataSourceOptions(),
        database: 'test',
    } as DataSourceOptions;
}

export async function useTestDatabase() {
    const options = await buildOptions();

    await createDatabase({ options });

    const dataSource = new DataSource(options);
    await dataSource.initialize();
    await dataSource.synchronize();

    const { start } = buildRobotAggregator();
    start({ synchronous: true });

    const authSeeder = new AuthDatabaseRootSeeder({
        permissions: Object.values(PermissionKey),
        robotEnabled: true,
    });
    await authSeeder.run(dataSource);

    setDataSource(dataSource);

    return dataSource;
}

export async function dropTestDatabase() {
    const dataSource = await useDataSource();
    await dataSource.destroy();

    await unsetDataSource();

    await dropDatabase({ options: dataSource.options });
}
