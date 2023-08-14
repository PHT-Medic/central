/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DataSourceOptions } from 'typeorm';
import { readDataSourceOptionsFromEnv } from 'typeorm-extension';
import { EnvironmentName, useEnv } from '../../config';
import { extendDataSourceOptions } from './extend';

export async function buildDataSourceOptions() : Promise<DataSourceOptions> {
    const options = readDataSourceOptionsFromEnv();
    if (!options) {
        throw new Error('The database configuration could not be read from env variables.');
    }

    if (options.type !== 'mysql' && options.type !== 'postgres') {
        throw new Error(`The database type ${options.type} is not supported.`);
    }

    if (useEnv('env') === EnvironmentName.TEST) {
        Object.assign(options, {
            database: 'test',
        } satisfies Partial<DataSourceOptions>);
    }

    return extendDataSourceOptions(options);
}
