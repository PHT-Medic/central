/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Config } from '@trapi/client';
import { detectProxyConnectionConfig } from '@personalhealthtrain/central-common';
import { HarborClient } from '@trapi/harbor-client';

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
