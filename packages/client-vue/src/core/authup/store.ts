/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Store,
    _ExtractActionsFromSetupStore,
    _ExtractGettersFromSetupStore,
    _ExtractStateFromSetupStore,
} from 'pinia';
import type { createStore } from '@authup/client-vue';
import type { App } from 'vue';
import { inject, provide } from 'vue';

type StoreData = ReturnType<typeof createStore>;
export type AuthupStore = Store<
string,
_ExtractStateFromSetupStore<StoreData>,
_ExtractGettersFromSetupStore<StoreData>,
_ExtractActionsFromSetupStore<StoreData>
>;

const symbol = Symbol.for('AuthupStore');
export function injectAuthupStore() : AuthupStore {
    const store = inject(symbol);
    if (!store) {
        throw new Error('The Authup Store is not set.');
    }

    return store as AuthupStore;
}

export function provideAuthupStore(store: AuthupStore, instance?: App) {
    if (instance) {
        instance.provide(symbol, store);
        return;
    }

    provide(symbol, store);
}
