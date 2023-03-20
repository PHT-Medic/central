/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { detectProxyConnectionConfig } from '@personalhealthtrain/central-common';
import type { Client } from '@hapic/harbor';
import { createClient } from '@hapic/harbor';

export function createBasicHarborAPIClient(connectionString: string) : Client {
    const proxyConfig = detectProxyConnectionConfig();

    return createClient({
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
    });
}
