/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIClient } from '@authup/core';
import type { App } from 'vue';
import { inject, provide } from 'vue';

const symbol = Symbol.for('AuthupAPIClient');

export type AuthupAPIClient = APIClient;
export function provideAuthupAPIClient(client: APIClient, instance?: App) {
    if (instance) {
        instance.provide(symbol, client);
        return;
    }

    provide(symbol, client);
}

export function injectAuthupAPIClient() : APIClient {
    const instance = inject(symbol);
    if (!instance) {
        throw new Error('The Authup API Client is not set.');
    }

    return instance as APIClient;
}
