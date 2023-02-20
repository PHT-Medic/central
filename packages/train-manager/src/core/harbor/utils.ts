/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Config } from 'hapic';
import { detectProxyConnectionConfig } from '@personalhealthtrain/central-common';
import { Client as HarborClient } from '@hapic/harbor';

export function createBasicHarborAPIConfig(connectionString: string) : Config {
    const proxyConfig = detectProxyConnectionConfig();

    return {
        clazz: HarborClient,
        driver: {
            ...(proxyConfig ? {
                proxy: proxyConfig,
            } : {
                proxy: false,
            }),
        },
        extra: {
            connectionString,
        },
    };
}
