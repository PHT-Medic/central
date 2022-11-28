/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { parseProxyConnectionString } from '@personalhealthtrain/central-common';
import { ClientOptions } from 'minio';

let instance : ClientOptions | undefined;

export function setMinioConfig(input: string | ClientOptions) {
    if (typeof input !== 'string') {
        instance = input;

        return;
    }

    const parsed = parseProxyConnectionString(input);

    instance = {
        endPoint: parsed.host,
        port: parsed.port,
        accessKey: parsed.auth.username,
        secretKey: parsed.auth.password,
    };
}

export function useMinioConfig() : ClientOptions {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    throw new Error('Minio Config is not set.');
}
