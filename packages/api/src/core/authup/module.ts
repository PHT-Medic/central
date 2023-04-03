/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIClient } from '@authup/core';
import { ServerError } from '@ebec/http';

let instance : APIClient;

export function useAuthupClient() {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    throw new ServerError('The authup client is not initialised.');
}

export function setAuthupClient(client: APIClient) {
    instance = client;
}
