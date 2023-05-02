/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { REALM_MASTER_NAME } from '@authup/core';
import { storeToRefs } from 'pinia';
import type { Ref } from 'vue';
import { computed } from 'vue';
import { useAuthStore } from '../../store/auth';

type Value = string | null | undefined;
export function realmIdForSocket(realmId?: Value | Ref<Value>) {
    const store = useAuthStore();
    const refs = storeToRefs(store);
    return computed(() => {
        if (realmId) {
            return isRef(realmId) ? realmId.value : realmId;
        }

        if (refs.realmName.value === REALM_MASTER_NAME) {
            return undefined;
        }

        return refs.realmId.value;
    });
}
