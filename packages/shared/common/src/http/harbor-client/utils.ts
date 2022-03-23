/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Config } from '@trapi/client';
import https from 'https';
import { ProxyConnectionConfig, detectProxyConnectionConfig } from '../../utils';
import { HarborAPI } from './module';

export function createBasicHarborAPIConfig(connectionString: string) : Config {
    const proxyConfig : ProxyConnectionConfig | undefined = detectProxyConnectionConfig();

    return {
        clazz: HarborAPI,
        driver: {
            proxy: proxyConfig,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        },
        extra: {
            connectionString,
        },
    };
}
