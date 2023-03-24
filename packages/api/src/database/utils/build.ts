/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DataSourceOptions } from 'typeorm';
import { buildDataSourceOptions as _buildDataSourceOptions } from 'typeorm-extension';
import { EnvironmentName, useEnv } from '../../config';
import { extendDataSourceOptions } from './extend';

export async function buildDataSourceOptions() : Promise<DataSourceOptions> {
    const options = await _buildDataSourceOptions();

    if (useEnv('env') === EnvironmentName.TEST) {
        Object.assign(options, {
            database: 'test',
        } satisfies Partial<DataSourceOptions>);
    }

    return extendDataSourceOptions(options);
}
