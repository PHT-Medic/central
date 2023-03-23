/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { HTTPClient } from '@authup/common';
import { ServerError } from '@ebec/http';

let instance : HTTPClient;

export function useAuthupClient() {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    throw new ServerError('The authup client is not initialised.');
}

export function setAuthupClient(client: HTTPClient) {
    instance = client;
}
