/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    ServiceID, StationRegistryAPICommand,
} from '@personalhealthtrain/central-common';
import { useToast } from 'bootstrap-vue-next';
import { defineComponent, h, ref } from 'vue';
import { injectAPIClient, wrapFnWithBusyState } from '../../core';
import EntityDelete from '../EntityDelete';
import MasterImageList from '../master-image/MasterImageList';

export default defineComponent({
    components: { EntityDelete, MasterImageList },
    setup() {
        const toast = useToast();
        const busy = ref(false);
        const sync = wrapFnWithBusyState(busy, async () => {
            try {
                await injectAPIClient()
                    .service.runCommand(ServiceID.STATION_REGISTRY, StationRegistryAPICommand.SYNC);

                if (toast) {
                    toast.success({ body: 'You successfully executed the sync routine.' }, {
                        pos: 'top-center',
                    });
                }
            } catch (e) {
                if (e instanceof Error && toast) {
                    toast.danger({ body: e.message }, {
                        pos: 'top-center',
                    });
                }
            }
        });

        return () => h('div', [
            h('h6', [
                h('i', { class: 'fa-solid fa-rotate me-1' }),
                'Synchronization',
            ]),
            h('p', { class: 'mb-1' }, [
                'This operation will synchronize realms & stations from the station-registry and',
                ' ',
                'register the corresponding public keys in the secret-storage.',
            ]),
            h('hr'),
            h('button', {
                type: 'button',
                disabled: busy.value,
                class: 'btn btn-xs btn-dark',
                onClick(event: any) {
                    event.preventDefault();

                    return sync();
                },
            }, [
                h('i', { class: 'fa-solid fa-rotate me-1' }),
                'Sync',
            ]),
        ]);
    },
});
