/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { injectAPIClient, provideAPIClient } from '@authup/client-vue';
import type { APIClient } from '@authup/core';
import type { App } from 'vue';

export type AuthupAPIClient = APIClient;
export function provideAuthupAPIClient(client: APIClient, instance?: App) {
    provideAPIClient(client, instance);
}

export function injectAuthupAPIClient() : APIClient {
    return injectAPIClient();
}
