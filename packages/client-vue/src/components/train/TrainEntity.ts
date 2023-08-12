/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DomainType,
} from '@personalhealthtrain/central-common';
import type {
    Train,
} from '@personalhealthtrain/central-common';
import {
    defineComponent,
} from 'vue';
import type { SlotsType } from 'vue';
import type { EntityManagerSlotsType } from '../../core';
import {
    createEntityManager,
    defineEntityManagerEvents,
    defineEntityManagerProps,
} from '../../core';

export default defineComponent({
    props: defineEntityManagerProps<Train>(),
    emits: defineEntityManagerEvents<Train>(),
    slots: Object as SlotsType<EntityManagerSlotsType<Train>>,
    async setup(props, setup) {
        const manager = createEntityManager({
            type: `${DomainType.TRAIN}`,
            setup,
            props,
        });

        try {
            await manager.resolveOrFail();

            return () => manager.render();
        } catch (e) {
            return () => manager.renderError(e);
        }
    },
});
