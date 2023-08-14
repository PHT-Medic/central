/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent, h, ref } from 'vue';
import type { Registry } from '@personalhealthtrain/core';
import { RegistryAPICommand } from '@personalhealthtrain/core';
import EntityDelete from '../EntityDelete';
import MasterImageList from '../master-image/MasterImageList';
import { injectAPIClient } from '../../core';

export default defineComponent({
    components: { EntityDelete, MasterImageList },
    props: {
        entityId: {
            type: String as PropType<Registry['id']>,
            required: true,
        },
    },
    emits: ['executed', 'failed'],
    setup(props, { emit }) {
        const busy = ref(false);
        const apiClient = injectAPIClient();

        const execute = async () => {
            if (busy.value) return;

            busy.value = true;

            try {
                await apiClient.service.runRegistryCommand(RegistryAPICommand.CLEANUP, {
                    id: props.entityId,
                });

                emit('executed');
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }

            busy.value = false;
        };

        return () => h('div', [
            h('p', { class: 'mb-1' }, [
                'This command will remove any registry project which is not present in the current instance.',
            ]),

            h('button', {
                type: 'button',
                disabled: busy.value,
                class: 'btn btn-xs btn-dark',
                onClick(event: any) {
                    event.preventDefault();

                    return execute();
                },
            }, [
                'Execute',
            ]),
        ]);
    },
});
