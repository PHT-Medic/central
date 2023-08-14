/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from 'minio';
import { useMinioConfig } from './config';

let instance : undefined | Client;

export function useMinio() {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    const config = useMinioConfig();
    instance = new Client(config);

    return instance;
}
