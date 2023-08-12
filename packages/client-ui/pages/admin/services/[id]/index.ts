/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { toRefs } from 'vue';
import type { PropType } from 'vue';
import { ServiceID } from '@personalhealthtrain/central-common';
import { MasterImagesSync, StationRegistryManagement } from '@personalhealthtrain/client-vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    props: {
        entityId: {
            type: String as PropType<ServiceID>,
            required: true,
        },
    },
    emits: ['updated'],
    setup(props, { emit }) {
        const refs = toRefs(props);

        if (refs.entityId.value === ServiceID.REGISTRY) {
            return () => h(MasterImagesSync, {
                entityId: refs.entityId.value,
                onUpdated(event: any) {
                    emit('updated', event);
                },
            });
        }

        if (refs.entityId.value === ServiceID.STATION_REGISTRY) {
            return () => h(StationRegistryManagement, {
                entityId: refs.entityId.value,
            });
        }

        return () => h('div', {
            class: 'alert alert-info alert-sm',
        }, `You can not execute any task for the ${refs.entityId.value} service yet.`);
    },
});
